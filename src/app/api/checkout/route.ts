import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getEvent } from "@/lib/db/events";
import { getUserByEmail, createUser } from "@/lib/db/users";
import { setSessionCookie, getCurrentUser } from "@/lib/auth/session";
import { createOrder, generateOrderId, updateOrder } from "@/lib/ticketing/store";
import { initializeTransaction } from "@/lib/ticketing/paystack";
import { Order, OrderItem } from "@/lib/ticketing/types";
import { Resend } from "resend";

interface CheckoutBody {
  eventId: string;
  buyerName: string;
  buyerEmail: string;
  items: { tierName: string; quantity: number }[];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutBody;
    const { eventId, buyerName, buyerEmail, items } = body;

    if (!eventId || !buyerName || !buyerEmail || !items?.length) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(buyerEmail)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    const event = await getEvent(eventId);
    if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

    // Price server-side from the event's own tier list — never trust client-sent prices.
    const orderItems: OrderItem[] = [];
    let subtotal = 0;
    let fees = 0;
    for (const line of items) {
      if (line.quantity <= 0) continue;
      const tier = event.tiers.find((t) => t.name === line.tierName);
      if (!tier) return NextResponse.json({ error: `Unknown ticket tier: ${line.tierName}` }, { status: 400 });
      orderItems.push({ tierName: tier.name, quantity: line.quantity, unitPrice: tier.price, unitFee: tier.fee });
      subtotal += tier.price * line.quantity;
      fees += tier.fee * line.quantity;
    }

    if (orderItems.length === 0) {
      return NextResponse.json({ error: "Select at least one ticket." }, { status: 400 });
    }

    // Link this order to an account so the buyer can see their tickets on a
    // dashboard later. Use the already-logged-in session if present;
    // otherwise find-or-create an account by email so a login isn't required
    // before buying (standard ticketing UX), and let them know via email.
    const loggedInUser = await getCurrentUser();
    let buyerUser = loggedInUser ?? (await getUserByEmail(buyerEmail));
    let isNewAccount = false;

    if (!buyerUser) {
      const tempPassword = crypto.randomBytes(6).toString("base64url");
      buyerUser = await createUser({ name: buyerName, email: buyerEmail, password: tempPassword, role: "customer" });
      isNewAccount = true;
      await sendAccountCreatedEmail(buyerEmail, buyerName, tempPassword);
    }

    if (!loggedInUser) {
      await setSessionCookie(buyerUser.id, buyerUser.role);
    }

    const total = subtotal + fees;
    const orderId = generateOrderId();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;

    const order: Order = {
      id: orderId,
      eventId,
      userId: buyerUser.id,
      buyerName,
      buyerEmail,
      items: orderItems,
      subtotal,
      fees,
      total,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    await createOrder(order);

    const callbackUrl = `${baseUrl}/tickets/confirm?order=${orderId}`;
    const init = await initializeTransaction({
      email: buyerEmail,
      amountKobo: Math.round(total * 100),
      reference: `${orderId}-${Date.now()}`,
      callbackUrl,
      metadata: { orderId, eventId },
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
  const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/login`;

  if (!apiKey) {
    console.log(
      `[checkout] (dry run, no RESEND_API_KEY) would email ${email} their new account: temp password "${tempPassword}", login at ${loginUrl}`
    );
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
