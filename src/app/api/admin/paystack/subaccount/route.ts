import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getSettings, updateSettings } from "@/lib/db/settings";
import { createSubaccount, isDryRun, listBanks, resolveAccount } from "@/lib/ticketing/paystack";
import { enforceRateLimit } from "@/lib/rateLimit";

/**
 * Creates the Paystack subaccount that ticket payouts settle to, and stores its
 * code in site settings. Once that code is present, every checkout passes it to
 * Paystack and the split happens automatically at settlement.
 *
 * The account is resolved with Paystack BEFORE the subaccount is created, so a
 * typo fails here instead of sending a payout to the wrong bank account —
 * Paystack will not reverse a payout made to an incorrect account.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  // Each call hits Paystack's API; don't let a stuck admin loop hammer it.
  const limited = enforceRateLimit(req, "paystack-subaccount", 5, 60 * 60 * 1000, user.id);
  if (limited) return limited;

  if (isDryRun()) {
    return NextResponse.json(
      { error: "Connect a Paystack secret key first — a subaccount must be created with the same key that will process payments." },
      { status: 400 }
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const body = (raw ?? {}) as { bankCode?: unknown; accountNumber?: unknown; percentageCharge?: unknown };

  const bankCode = typeof body.bankCode === "string" ? body.bankCode.trim() : "";
  if (!/^\d{2,6}$/.test(bankCode)) {
    return NextResponse.json({ error: "Choose a bank from the list." }, { status: 400 });
  }

  const accountNumber = typeof body.accountNumber === "string" ? body.accountNumber.replace(/\D/g, "") : "";
  if (!/^\d{10}$/.test(accountNumber)) {
    return NextResponse.json({ error: "Enter the 10-digit Nigerian bank account number." }, { status: 400 });
  }

  const percentage = typeof body.percentageCharge === "number" ? body.percentageCharge : NaN;
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
    return NextResponse.json({ error: "Percentage must be a number between 0 and 100." }, { status: 400 });
  }

  const existing = await getSettings();

  try {
    // Resolve first so we can show (and store) the real account name.
    const resolved = await resolveAccount(accountNumber, bankCode);

    const subaccount = await createSubaccount({
      businessName: resolved.accountName,
      bankCode,
      accountNumber,
      percentageCharge: percentage,
    });

    // Bank name is looked up server-side rather than trusted from the client.
    let bankName: string | undefined;
    try {
      bankName = (await listBanks()).find((b) => b.code === bankCode)?.name;
    } catch {
      // Display-only; not worth failing the whole operation over.
    }

    await updateSettings({
      paystackSubaccountCode: subaccount.subaccountCode,
      paystackSubaccountName: subaccount.accountName,
      paystackSubaccountAccountLast4: accountNumber.slice(-4),
      paystackSubaccountBankName: bankName,
      paystackSubaccountPercentage: percentage,
    });

    return NextResponse.json({
      ok: true,
      accountName: subaccount.accountName,
      bankName: bankName ?? null,
      accountLast4: accountNumber.slice(-4),
      percentageCharge: percentage,
      subaccountCode: subaccount.subaccountCode,
      dryRun: subaccount.dryRun,
      replaced: existing.paystackSubaccountCode ? true : false,
    });
  } catch (err) {
    console.error("[paystack] subaccount creation failed", err);
    const message = err instanceof Error ? err.message : "";
    // Paystack explains refusals in the body; surface something actionable
    // without dumping the raw API response into the UI.
    const hint = /could not resolve|invalid account|account_number/i.test(message)
      ? "Paystack couldn't verify that account number with the selected bank. Double-check both."
      : "Paystack rejected the subaccount. Confirm the bank and account details, then try again.";
    return NextResponse.json({ error: hint }, { status: 502 });
  }
}

/** Stops splitting: existing payments are unaffected, future ones settle fully
 * to the main account. The subaccount itself stays on Paystack. */
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const limited = enforceRateLimit(req, "paystack-subaccount", 10, 60 * 60 * 1000, user.id);
  if (limited) return limited;

  await updateSettings({
    paystackSubaccountCode: undefined,
    paystackSubaccountName: undefined,
    paystackSubaccountAccountLast4: undefined,
    paystackSubaccountBankName: undefined,
    paystackSubaccountPercentage: undefined,
  });

  return NextResponse.json({ ok: true });
}
