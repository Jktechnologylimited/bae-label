/**
 * Thin wrapper around Paystack's REST API. No SDK dependency — just fetch.
 *
 * "Dry run" mode lets the full purchase → ticket → verification flow be
 * exercised locally with no Paystack account and no network. It is available
 * **only** when PAYSTACK_SECRET_KEY is unset *and* NODE_ENV is not
 * "production". In production a missing key is a hard error instead of a
 * silent bypass, and nothing about dry-run is ever driven by request input
 * (previously a `?dryRun=1` query parameter could skip payment verification
 * entirely — see the code review, findings C2/H2).
 *
 * paystack.co is not reachable from the build sandbox, so the live calls
 * below are written to Paystack's documented API and have not been exercised
 * against the real service here — test with a real secret key (test mode)
 * before going live.
 */

const PAYSTACK_BASE = "https://api.paystack.co";

export interface InitializeResult {
  authorizationUrl: string;
  reference: string;
  dryRun: boolean;
}

export interface VerifyResult {
  success: boolean;
  reference: string;
  /** Amount actually paid, in kobo (Paystack's smallest unit). */
  amountKobo?: number;
  currency?: string;
  dryRun: boolean;
}

/** Local-only fallback. Never true in production. */
export function isDryRun(): boolean {
  return !process.env.PAYSTACK_SECRET_KEY && process.env.NODE_ENV !== "production";
}

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (key) return key;
  throw new Error(
    "PAYSTACK_SECRET_KEY is not set. Ticket checkout requires it in production — refusing to " +
      "treat payments as successful without it (see .env.example)."
  );
}

export async function initializeTransaction(params: {
  email: string;
  amountKobo: number; // Paystack amounts are in kobo (smallest unit)
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<InitializeResult> {
  if (isDryRun()) {
    console.log(
      `[paystack] (dry run, no PAYSTACK_SECRET_KEY) would initialize ₦${params.amountKobo / 100} for ${params.email}`
    );
    // Note: no trust flag is appended to the callback URL — dry-run is decided
    // server-side, so the URL cannot be used to skip verification.
    return { authorizationUrl: params.callbackUrl, reference: params.reference, dryRun: true };
  }

  const secretKey = getSecretKey();

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paystack initialize failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  return {
    authorizationUrl: json.data.authorization_url,
    reference: json.data.reference,
    dryRun: false,
  };
}

export async function verifyTransaction(reference: string): Promise<VerifyResult> {
  if (isDryRun()) {
    console.log(`[paystack] (dry run, no PAYSTACK_SECRET_KEY) treating ${reference} as paid`);
    return { success: true, reference, dryRun: true };
  }

  const secretKey = getSecretKey();

  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paystack verify failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  const data = json?.data ?? {};
  return {
    success: data.status === "success",
    reference,
    amountKobo: typeof data.amount === "number" ? data.amount : undefined,
    currency: typeof data.currency === "string" ? data.currency : undefined,
    dryRun: false,
  };
}
