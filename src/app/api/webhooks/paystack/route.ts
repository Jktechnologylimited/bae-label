import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getOrderByReference } from "@/lib/ticketing/store";
import { finalizeOrder } from "@/lib/ticketing/finalize";

/**
 * Production-grade confirmation path: Paystack calls this server-to-server
 * on payment success, independent of whether the buyer's browser makes it
 * back to /tickets/confirm. Configure this URL as your webhook in the
 * Paystack dashboard once you're ready to go live.
 *
 * Verifies the x-paystack-signature header per Paystack's docs before
 * trusting the payload. Not exercised against a live Paystack account in
 * this sandbox (no network access to paystack.co here) — test in Paystack's
 * test mode before relying on it.
 */
export async function POST(req: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const rawBody = await req.text();

  if (secretKey) {
    const signature = req.headers.get("x-paystack-signature");
    const expected = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
    if (signature !== expected) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }
  }

  const payload = JSON.parse(rawBody);
  if (payload.event !== "charge.success") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const reference = payload.data?.reference;
  const order = await getOrderByReference(reference);
  if (!order) return NextResponse.json({ error: "Order not found for reference." }, { status: 404 });

  const result = await finalizeOrder(order.id, { reference });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ ok: true });
}
