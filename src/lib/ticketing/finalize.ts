import { getOrder, markOrderPaidIfPending, createTickets, getTicketsByOrder } from "./store";
import { verifyTransaction } from "./paystack";
import { generateTicketQr } from "./qr";
import { Order, Ticket } from "./types";
import { MAX_TICKETS_PER_ORDER, itemCount, itemsAmountKobo } from "./amounts";
import { withTransaction } from "@/lib/db/pg";
import { siteBaseUrl } from "@/lib/site";
import { Resend } from "resend";

export interface FinalizedTicket extends Ticket {
  qrDataUrl: string;
}

export interface FinalizeSuccess {
  order: Order;
  tickets: FinalizedTicket[];
  baseUrl: string;
}
export interface FinalizeFailure {
  error: string;
  /** True when the failure is worth retrying (we couldn't reach Paystack),
   * as opposed to a definitive answer about the payment. */
  retryable?: boolean;
}
export type FinalizeResult = FinalizeSuccess | FinalizeFailure;

/**
 * Confirms payment for an order and issues digital tickets.
 *
 * Idempotent and concurrency-safe: the transition to "paid" is a single
 * conditional UPDATE (`markOrderPaidIfPending`) inside the same transaction
 * that inserts the tickets, so a webhook and the buyer's redirect racing each
 * other produce one set of tickets, not two 500s.
 *
 * Nothing about *whether to trust the payment* comes from the caller — the
 * reference is always the one stored on the order, and the amount and
 * currency returned by Paystack must match what the order was priced at.
 * (Previously a `?dryRun=1` query parameter or a client-supplied `reference`
 * could finalize an order without payment — review findings C2 and C7.)
 */
export async function finalizeOrder(orderId: string): Promise<FinalizeResult> {
  const order = await getOrder(orderId);
  if (!order) return { error: "Order not found." };

  const baseUrl = await resolveBaseUrl(order);

  // Already finalized — return the existing tickets.
  if (order.status === "paid") {
    const existing = await getTicketsByOrder(orderId);
    return { order, tickets: await withQr(existing, baseUrl), baseUrl };
  }

  const reference = order.paystackReference;
  if (!reference) return { error: "Missing payment reference." };

  let verification;
  try {
    verification = await verifyTransaction(reference);
  } catch (err) {
    // Paystack unreachable or erroring — leave the order pending so a later
    // retry (webhook redelivery, page refresh) can still confirm it.
    console.error("[finalizeOrder] payment verification request failed", err);
    return { retryable: true, error: "We couldn't reach the payment provider. Please try again in a moment." };
  }

  if (!verification.success) {
    // A definitive "not successful" answer. The order is deliberately left
    // pending rather than marked failed: Paystack can report a transaction as
    // pending/abandoned and still succeed later, and marking it failed here
    // would permanently block it.
    return { error: "Payment could not be verified." };
  }

  // Everything below is the old "dry run" shortcut made safe: dry-run is only
  // possible outside production (see paystack.isDryRun), so skipping the
  // amount comparison cannot happen in a real deployment.
  if (!verification.dryRun) {
    const expectedKobo = itemsAmountKobo(order.items);
    if (typeof verification.amountKobo !== "number") {
      console.error("[finalizeOrder] Paystack verify returned no amount", { orderId, reference });
      return { error: "We couldn't confirm the amount paid for this order. Please contact us and we'll sort it out." };
    }
    if (verification.amountKobo !== expectedKobo) {
      console.error("[finalizeOrder] amount mismatch — refusing to issue tickets", {
        orderId,
        reference,
        paidKobo: verification.amountKobo,
        expectedKobo,
      });
      return { error: "The amount paid doesn't match this order, so we haven't issued tickets. Please contact us." };
    }
    if (verification.currency && verification.currency !== "NGN") {
      console.error("[finalizeOrder] unexpected currency", { orderId, currency: verification.currency });
      return { error: "This order must be paid in NGN. Please contact us so we can sort it out." };
    }
  }

  const ticketCount = itemCount(order.items);
  if (ticketCount <= 0 || ticketCount > MAX_TICKETS_PER_ORDER) {
    console.error("[finalizeOrder] refusing to issue an implausible ticket count", { orderId, ticketCount });
    return { error: "This order looks invalid. Please contact us and we'll sort it out." };
  }

  const newTickets: Ticket[] = [];
  let seq = 1;
  for (const item of order.items) {
    for (let i = 0; i < item.quantity; i++) {
      newTickets.push({
        code: `${order.id}-${String(seq).padStart(2, "0")}`,
        orderId: order.id,
        eventId: order.eventId,
        tierName: item.tierName,
        holderName: order.buyerName,
        status: "valid",
        issuedAt: new Date().toISOString(),
      });
      seq++;
    }
  }

  const paidOrder = await withTransaction(async (q) => {
    const claimed = await markOrderPaidIfPending(
      order.id,
      { status: "paid", paidAt: new Date().toISOString(), paystackReference: reference },
      q
    );
    if (!claimed) return null; // another caller finalized it first
    await createTickets(newTickets, q);
    return claimed;
  });

  if (!paidOrder) {
    // Lost the race — return whatever the winner wrote.
    const current = await getOrder(order.id);
    if (!current) return { error: "Order could not be updated." };
    const existing = await getTicketsByOrder(order.id);
    return { order: current, tickets: await withQr(existing, baseUrl), baseUrl };
  }

  const withQrCodes = await withQr(newTickets, baseUrl);

  // Only the caller that actually finalized the order sends the email, so a
  // webhook replay doesn't spam the buyer.
  await sendTicketEmail(paidOrder, withQrCodes, baseUrl).catch((err) =>
    console.error("[finalizeOrder] ticket email failed", err)
  );

  return { order: paidOrder, tickets: withQrCodes, baseUrl };
}

async function resolveBaseUrl(order: Order): Promise<string> {
  // Checkout stamps the origin it was purchased from, so webhook-driven
  // finalization (which has no request context) still builds correct links.
  if (order.baseUrl) return order.baseUrl;
  return siteBaseUrl();
}

async function withQr(tickets: Ticket[], baseUrl: string): Promise<FinalizedTicket[]> {
  return Promise.all(tickets.map(async (t) => ({ ...t, qrDataUrl: await generateTicketQr(t.code, baseUrl) })));
}

async function sendTicketEmail(order: Order, tickets: FinalizedTicket[], baseUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const links = tickets.map((t) => `${baseUrl}/ticket/${t.code}`).join("\n");

  if (!apiKey) {
    console.log(
      `[tickets] (dry run, no RESEND_API_KEY) would email ${order.buyerEmail} ${tickets.length} ticket(s)`
    );
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.RESEND_FROM ?? "BAE <noreply@bae.band>",
    to: order.buyerEmail,
    subject: `Your BAE tickets — Order ${order.id}`,
    text: `Thanks for your order, ${order.buyerName}!\n\nYour digital ticket(s):\n${links}\n\nSee you there.`,
  });
}
