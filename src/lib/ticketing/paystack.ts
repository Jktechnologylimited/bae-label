/**
 * Thin wrapper around Paystack's REST API. No SDK dependency — just fetch.
 *
 * Without PAYSTACK_SECRET_KEY set, every function runs in "dry run" mode:
 * initialize() fabricates an authorization URL that skips straight to the
 * confirmation page, and verify() always reports success. This lets the full
 * purchase → ticket → verification flow be tested locally with zero external
 * accounts, exactly like the Resend routes already do.
 *
 * paystack.co is not reachable from this build/dev sandbox, so the live
 * calls below are written to spec from Paystack's docs but have not been
 * exercised against the real API in this environment — test with a real
 * secret key (test mode) before going live.
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
  amount?: number;
  dryRun: boolean;
}

function getSecretKey() {
  return process.env.PAYSTACK_SECRET_KEY;
}

export async function initializeTransaction(params: {
  email: string;
  amountKobo: number; // Paystack amounts are in kobo (smallest unit)
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<InitializeResult> {
  const secretKey = getSecretKey();

  if (!secretKey) {
    console.log(`[paystack] (dry run, no PAYSTACK_SECRET_KEY) would initialize ₦${params.amountKobo / 100} for ${params.email}`);
    return {
      authorizationUrl: `${params.callbackUrl}&dryRun=1`,
      reference: params.reference,
      dryRun: true,
    };
  }

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
  const secretKey = getSecretKey();

  if (!secretKey) {
    console.log(`[paystack] (dry run, no PAYSTACK_SECRET_KEY) treating ${reference} as paid`);
    return { success: true, reference, dryRun: true };
  }

  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paystack verify failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  const status = json?.data?.status;
  return {
    success: status === "success",
    reference,
    amount: json?.data?.amount,
    dryRun: false,
  };
}
