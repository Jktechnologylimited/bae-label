import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getOrderByReference } from "@/lib/ticketing/store";
import { finalizeOrder } from "@/lib/ticketing/finalize";

/**
 * Production confirmation path: Paystack calls this server-to-server on
 * payment success, independent of whether the buyer's browser makes it back
 * to /tickets/confirm. Configure this URL as your webhook in the Paystack
 * dashboard once you're ready to go live.
 *
 * The signature check is mandatory in production. It previously ran only
 * `if (secretKey)`, so an unset key silently turned this into an
 * unauthenticated "mark any order paid" endpoint (review finding C4).
 *
 * The payload's amount is deliberately not trusted: `finalizeOrder` re-verifies
 * the transaction with Paystack and compares amount and currency against the
 * order before issuing anything.
 */
export async function POST(req: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const rawBody = await req.text();

  if (!secretKey) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[paystack webhook] PAYSTACK_SECRET_KEY is not set — refusing to process a webhook whose signature cannot be verified."
      );
      return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
    }
    console.warn(
      "[paystack webhook] PAYSTACK_SECRET_KEY is not set — skipping signature verification. This is allowed in development only."
    );
  } else {
    const signature = req.headers.get("x-paystack-signature") ?? "";
    const expected = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
    if (!timingSafeEqualHex(signature, expected)) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }
  }

  let payload: { event?: string; data?: { reference?: unknown } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (payload.event !== "charge.success") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const reference = payload.data?.reference;
  if (typeof reference !== "string" || !reference) {
    return NextResponse.json({ error: "Missing reference." }, { status: 400 });
  }

  const order = await getOrderByReference(reference);
  if (!order) return NextResponse.json({ error: "Order not found for reference." }, { status: 404 });

  const result = await finalizeOrder(order.id);
  if ("error" in result) {
    // 502 on a retryable failure so Paystack redelivers; 400 for a definitive
    // refusal (bad amount, already-void order, ...).
    return NextResponse.json({ error: result.error }, { status: result.retryable ? 502 : 400 });
  }

  return NextResponse.json({ ok: true });
}

/** Length-checked, constant-time comparison of two hex digests. */
function timingSafeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
