import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getEvent } from "@/lib/db/events";
import { getUserByEmail, createUser } from "@/lib/db/users";
import { getCurrentUser } from "@/lib/auth/session";
import { createOrder, generateOrderId, updateOrder } from "@/lib/ticketing/store";
import { initializeTransaction } from "@/lib/ticketing/paystack";
import { getSettings } from "@/lib/db/settings";
import { MAX_PER_TIER, MAX_TICKETS_PER_ORDER, MAX_TIER_LINES, itemsAmountKobo } from "@/lib/ticketing/amounts";
import { Order, OrderItem } from "@/lib/ticketing/types";
import { siteBaseUrl } from "@/lib/site";
import { enforceRateLimit } from "@/lib/rateLimit";
import { Resend } from "resend";

interface CheckoutBody {
  eventId: string;
  buyerName: string;
  buyerEmail: string;
  items: { tierName: string; quantity: number }[];
}

export async function POST(req: NextRequest) {
  // Public, unauthenticated, writes rows and triggers an email — worth a limit.
  const limited = enforceRateLimit(req, "checkout", 10, 10 * 60 * 1000);
  if (limited) return limited;

  try {
    const body = (await req.json()) as CheckoutBody;
    const { eventId, buyerName, buyerEmail, items } = body;

    if (!eventId || !buyerName || !buyerEmail || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    if (typeof buyerName !== "string" || typeof buyerEmail !== "string" || typeof eventId !== "string") {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    if (buyerName.trim().length < 1 || buyerName.length > 120 || buyerEmail.length > 254) {
      return NextResponse.json({ error: "Please check the name and email you entered." }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(buyerEmail)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }
    if (items.length > MAX_TIER_LINES) {
      return NextResponse.json({ error: "Too many different ticket types in one order." }, { status: 400 });
    }

    const event = await getEvent(eventId);
    if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
    if (event.status !== "upcoming") {
      return NextResponse.json({ error: "Tickets for this event are no longer on sale." }, { status: 400 });
    }

    // Price server-side from the event's own tier list — never trust client-sent prices.
    const orderItems: OrderItem[] = [];
    for (const line of items) {
      if (!line || typeof line.tierName !== "string") {
        return NextResponse.json({ error: "Invalid ticket selection." }, { status: 400 });
      }
      // Quantities must be whole, positive numbers. Previously any number
      // passed (including 0.001, which was charged a fraction but issued a
      // whole ticket because issuance loops `i < quantity`).
      if (!Number.isInteger(line.quantity) || line.quantity < 1) {
        return NextResponse.json(
          { error: `Choose a whole number of tickets (between 1 and ${MAX_PER_TIER}).` },
          { status: 400 }
        );
      }
      if (line.quantity > MAX_PER_TIER) {
        return NextResponse.json(
          { error: `You can buy up to ${MAX_PER_TIER} tickets of one type in a single order.` },
          { status: 400 }
        );
      }
      const tier = event.tiers.find((t) => t.name === line.tierName);
      if (!tier) return NextResponse.json({ error: `Unknown ticket tier: ${line.tierName}` }, { status: 400 });
      orderItems.push({ tierName: tier.name, quantity: line.quantity, unitPrice: tier.price, unitFee: tier.fee });
    }

    const ticketCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    if (ticketCount === 0) {
      return NextResponse.json({ error: "Select at least one ticket." }, { status: 400 });
    }
    if (ticketCount > MAX_TICKETS_PER_ORDER) {
      return NextResponse.json(
        { error: `You can buy up to ${MAX_TICKETS_PER_ORDER} tickets in a single order.` },
        { status: 400 }
      );
    }

    // Amounts are computed in kobo (integer minor units) so rounding happens
    // once and the charged amount is exactly what finalizeOrder later verifies.
    const subtotalKobo = orderItems.reduce((sum, item) => sum + Math.round(item.unitPrice * 100) * item.quantity, 0);
    const totalKobo = itemsAmountKobo(orderItems);
    const subtotal = subtotalKobo / 100;
    const fees = (totalKobo - subtotalKobo) / 100;
    const total = totalKobo / 100;

    // Link this order to an account so the buyer can see their tickets on a
    // dashboard later, and so the order is attributed to the right person.
    //
    //  SECURITY: never issue a session here. This endpoint is unauthenticated,
    //  so a session derived from the posted email would let anyone log in as
    //  any existing account — including an admin — just by typing its email
    //  (review finding C1). Guests buy without an account; they get one (and
    //  their tickets) by email, and can log in with the temporary password.
    const loggedInUser = await getCurrentUser();
    let buyerUser = loggedInUser ?? (await getUserByEmail(buyerEmail));
    let isNewAccount = false;

    if (!buyerUser) {
      const tempPassword = crypto.randomBytes(12).toString("base64url");
      try {
        buyerUser = await createUser({ name: buyerName, email: buyerEmail, password: tempPassword, role: "customer" });
        isNewAccount = true;
        await sendAccountCreatedEmail(buyerEmail, buyerName, tempPassword);
      } catch (err) {
        // Someone created the same account between our lookup and insert.
        const existing = await getUserByEmail(buyerEmail);
        if (!existing) throw err;
        console.warn("[checkout] account was created concurrently; attaching order to the existing account", err);
        buyerUser = existing;
      }
    }

    const orderId = generateOrderId();
    const baseUrl = await siteBaseUrl();

    const order: Order = {
      id: orderId,
      eventId,
      userId: buyerUser.id,
      buyerName: buyerName.trim(),
      buyerEmail,
      items: orderItems,
      subtotal,
      fees,
      total,
      status: "pending",
      baseUrl,
      createdAt: new Date().toISOString(),
    };
    await createOrder(order);

    const callbackUrl = `${baseUrl}/tickets/confirm?order=${encodeURIComponent(orderId)}`;
    // When a subaccount is configured, Paystack splits this payment at
    // settlement — the ticket money never passes through this account.
    const settings = await getSettings();
    const init = await initializeTransaction({
      email: buyerEmail,
      amountKobo: totalKobo,
      reference: `${orderId}-${Date.now()}`,
      callbackUrl,
      metadata: { orderId, eventId },
      subaccount: settings.paystackSubaccountCode,
    });

    await updateOrder(orderId, { paystackReference: init.reference });

    return NextResponse.json({
      orderId,
      authorizationUrl: init.authorizationUrl,
      dryRun: init.dryRun,
      newAccount: isNewAccount,
    });
  } catch (err) {
    console.error("[checkout] error", err);
    return NextResponse.json({ error: "Something went wrong starting checkout." }, { status: 500 });
  }
}

async function sendAccountCreatedEmail(email: string, name: string, tempPassword: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const loginUrl = `${await siteBaseUrl()}/login`;

  if (!apiKey) {
    // Deliberately does not log the temporary password.
    console.log(`[checkout] (dry run, no RESEND_API_KEY) would email ${email} their new account details`);
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.RESEND_FROM ?? "BAE <noreply@bae.band>",
    to: email,
    subject: "Your BAE account is ready",
    text: `Hi ${name},\n\nWe created a BAE account for you so you can view your tickets any time.\n\nEmail: ${email}\nTemporary password: ${tempPassword}\n\nLog in and change your password at ${loginUrl}`,
  });
}
