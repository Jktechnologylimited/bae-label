/**
 * Thin wrapper around Paystack's REST API. No SDK dependency — just fetch.
 *
 * "Dry run" mode lets the full purchase → ticket → verification flow be
 * exercised locally with no Paystack account and no network. It is available
 * **only** when PAYSTACK_SECRET_KEY is unset *and* NODE_ENV is not
 * "production". In production a missing key is a hard error instead of a
 * silent bypass, and nothing about dry-run is ever driven by request input.
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

export interface Bank {
  name: string;
  code: string;
}

export interface ResolvedAccount {
  accountNumber: string;
  accountName: string;
}

export interface SubaccountResult {
  subaccountCode: string;
  /** The account name the bank returned, so it can be shown for confirmation. */
  accountName: string;
  dryRun: boolean;
}

/** Local-only fallback. Never true in production. */
export function isDryRun(): boolean {
  return !process.env.PAYSTACK_SECRET_KEY && process.env.NODE_ENV !== "production";
}

/**
 * Which Paystack integration this deployment is talking to.
 *
 * Worth surfacing in the admin UI: subaccount codes are environment-specific,
 * so a payout account created with a test key is useless once a live key is in
 * place — and it fails at checkout rather than at setup, which is the worst
 * possible time to find out.
 */
export function paystackMode(): "live" | "test" | "none" {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) return "none";
  return key.startsWith("sk_live_") ? "live" : "test";
}

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (key) return key;
  throw new Error(
    "PAYSTACK_SECRET_KEY is not set. Ticket checkout requires it in production — refusing to " +
      "treat payments as successful without it (see .env.example)."
  );
}

interface PaystackResponse<T> {
  status?: boolean;
  message?: string;
  data?: T;
}

/** Single place that knows how to talk to Paystack: auth, JSON, error text. */
async function paystackRequest<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    ...(init?.body ? { body: JSON.stringify(init.body) } : {}),
  });

  const text = await res.text();
  if (!res.ok) {
    // Paystack explains refusals (bad bank code, unverified account, ...) in
    // the body, so surface it rather than a bare status.
    throw new Error(`Paystack ${path} failed: ${res.status} ${text}`);
  }

  let json: PaystackResponse<T>;
  try {
    json = JSON.parse(text) as PaystackResponse<T>;
  } catch {
    throw new Error(`Paystack ${path} returned a non-JSON response.`);
  }
  if (!json.status || json.data === undefined) {
    throw new Error(`Paystack ${path} did not succeed: ${json.message ?? "unknown error"}`);
  }
  return json.data;
}

export async function initializeTransaction(params: {
  email: string;
  amountKobo: number; // Paystack amounts are in kobo (smallest unit)
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
  /** Subaccount code to split this payment with (see createSubaccount). When
   * absent the payment settles entirely to the main account. */
  subaccount?: string;
}): Promise<InitializeResult> {
  if (isDryRun()) {
    console.log(
      `[paystack] (dry run, no PAYSTACK_SECRET_KEY) would initialize ₦${params.amountKobo / 100} for ${params.email}`
    );
    // Note: no trust flag is appended to the callback URL — dry-run is decided
    // server-side, so the URL cannot be used to skip verification.
    return { authorizationUrl: params.callbackUrl, reference: params.reference, dryRun: true };
  }

  const body: Record<string, unknown> = {
    email: params.email,
    amount: params.amountKobo,
    reference: params.reference,
    callback_url: params.callbackUrl,
    metadata: params.metadata,
  };

  // `bearer` is deliberately not set: with a single subaccount Paystack charges
  // the transaction fee to the main account, except when the main account's
  // share is 0% — in which case the subaccount bears it. Confirm which applies
  // with one real test transaction before trusting it with ticket revenue.
  if (params.subaccount) body.subaccount = params.subaccount;

  const data = await paystackRequest<{ authorization_url: string; reference: string }>("/transaction/initialize", {
    method: "POST",
    body,
  });

  return {
    authorizationUrl: data.authorization_url,
    reference: data.reference,
    dryRun: false,
  };
}

export async function verifyTransaction(reference: string): Promise<VerifyResult> {
  if (isDryRun()) {
    console.log(`[paystack] (dry run, no PAYSTACK_SECRET_KEY) treating ${reference} as paid`);
    return { success: true, reference, dryRun: true };
  }

  const data = await paystackRequest<{ status?: string; amount?: number; currency?: string }>(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );

  return {
    success: data.status === "success",
    reference,
    amountKobo: typeof data.amount === "number" ? data.amount : undefined,
    currency: typeof data.currency === "string" ? data.currency : undefined,
    dryRun: false,
  };
}

// ---- Subaccounts (split payments) ----

/**
 * Banks Paystack can settle to. Used to populate the admin dropdown so nobody
 * has to type a bank code by hand.
 *
 * Requires a real secret key — there is no sensible dry-run value, and a
 * fabricated bank list would be worse than an error.
 */
export async function listBanks(currency = "NGN"): Promise<Bank[]> {
  const data = await paystackRequest<{ name: string; code: string }[]>(`/bank?currency=${encodeURIComponent(currency)}`);
  return data.map((b) => ({ name: b.name, code: b.code }));
}

/**
 * Confirms a bank account exists and returns the name the bank holds it under.
 * Run before creating a subaccount so a typo can't send payouts to the wrong
 * account — Paystack will not reverse a payout made to an incorrect account.
 */
export async function resolveAccount(accountNumber: string, bankCode: string): Promise<ResolvedAccount> {
  const data = await paystackRequest<{ account_number: string; account_name: string }>(
    `/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`
  );
  return { accountNumber: data.account_number, accountName: data.account_name };
}

/**
 * Creates a subaccount: a bank account that a share of each transaction settles
 * to automatically.
 *
 * `percentageCharge` is the share the MAIN account keeps and, per Paystack's
 * API reference, is "the default percentage charged when receiving on behalf of
 * this subaccount". Their docs are genuinely ambiguous about the direction —
 * settle it with one real test transaction rather than assuming.
 */
export async function createSubaccount(params: {
  /** Defaults to the name the bank returns — the safest choice, since Paystack
   * validates the subaccount against the real account holder. */
  businessName?: string;
  bankCode: string;
  accountNumber: string;
  percentageCharge: number;
}): Promise<SubaccountResult> {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    if (process.env.NODE_ENV === "production") getSecretKey(); // throws, loudly
    console.log("[paystack] (dry run, no PAYSTACK_SECRET_KEY) would create a subaccount", {
      ...params,
      accountNumber: `****${params.accountNumber.slice(-4)}`,
    });
    return {
      subaccountCode: `ACCT_dryrun_${Date.now()}`,
      accountName: params.businessName ?? "Dry run",
      dryRun: true,
    };
  }

  const resolved = await resolveAccount(params.accountNumber, params.bankCode);

  const data = await paystackRequest<{ subaccount_code: string }>("/subaccount", {
    method: "POST",
    body: {
      business_name: params.businessName ?? resolved.accountName,
      settlement_bank: params.bankCode,
      account_number: params.accountNumber,
      percentage_charge: params.percentageCharge,
    },
  });

  return { subaccountCode: data.subaccount_code, accountName: resolved.accountName, dryRun: false };
}
