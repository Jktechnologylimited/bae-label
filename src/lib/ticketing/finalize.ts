import { getOrder, updateOrder, createTickets, getTicketsByOrder } from "./store";
import { verifyTransaction } from "./paystack";
import { generateTicketQr } from "./qr";
import { Order, Ticket } from "./types";
import { Resend } from "resend";

export interface FinalizedTicket extends Ticket {
  qrDataUrl: string;
}

/**
 * Confirms payment for an order and issues digital tickets. Idempotent —
 * safe to call more than once for the same order (e.g. if the buyer
 * refreshes the confirmation page, or a webhook and the redirect both fire).
 */
export async function finalizeOrder(
  orderId: string,
  opts: { reference?: string; dryRun?: boolean }
): Promise<{ order: Order; tickets: FinalizedTicket[]; baseUrl: string } | { error: string }> {
  const order = await getOrder(orderId);
  if (!order) return { error: "Order not found." };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Already finalized — just return the existing tickets.
  if (order.status === "paid") {
    const existing = await getTicketsByOrder(orderId);
    const withQr = await Promise.all(
      existing.map(async (t) => ({ ...t, qrDataUrl: await generateTicketQr(t.code, baseUrl) }))
    );
    return { order, tickets: withQr, baseUrl };
  }

  const reference = opts.reference ?? order.paystackReference;
  if (!reference) return { error: "Missing payment reference." };

  const verification = opts.dryRun ? { success: true, reference, dryRun: true } : await verifyTransaction(reference);

  if (!verification.success) {
    await updateOrder(orderId, { status: "failed" });
    return { error: "Payment could not be verified." };
  }

  const paidOrder = await updateOrder(orderId, {
    status: "paid",
    paidAt: new Date().toISOString(),
    paystackReference: reference,
  });
  if (!paidOrder) return { error: "Order could not be updated." };

  // Issue one ticket per unit purchased across all tiers.
  const newTickets: Ticket[] = [];
  let seq = 1;
  for (const item of order.items) {
    for (let i = 0; i < item.quantity; i++) {
      newTickets.push({
        code: `${orderId}-${String(seq).padStart(2, "0")}`,
        orderId,
        eventId: order.eventId,
        tierName: item.tierName,
        holderName: order.buyerName,
        status: "valid",
        issuedAt: new Date().toISOString(),
      });
      seq++;
    }
  }
  await createTickets(newTickets);

  const withQr = await Promise.all(
    newTickets.map(async (t) => ({ ...t, qrDataUrl: await generateTicketQr(t.code, baseUrl) }))
  );

  await sendTicketEmail(paidOrder, withQr, baseUrl).catch((err) =>
    console.error("[finalizeOrder] ticket email failed", err)
  );

  return { order: paidOrder, tickets: withQr, baseUrl };
}

async function sendTicketEmail(order: Order, tickets: FinalizedTicket[], baseUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const links = tickets.map((t) => `${baseUrl}/ticket/${t.code}`).join("\n");

  if (!apiKey) {
    console.log(`[tickets] (dry run, no RESEND_API_KEY) would email ${order.buyerEmail} ${tickets.length} ticket(s):\n${links}`);
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
