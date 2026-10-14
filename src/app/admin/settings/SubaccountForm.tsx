"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, AlertTriangle } from "lucide-react";

interface Bank {
  name: string;
  code: string;
}

export interface SubaccountConfig {
  code?: string;
  name?: string;
  bankName?: string;
  accountLast4?: string;
  percentage?: number;
}

const inputClass =
  "w-full border border-line bg-transparent px-4 py-3 text-sm text-paper placeholder:text-muted focus:outline-none focus:border-gold";

/**
 * Creates the Paystack subaccount that ticket payouts settle to.
 *
 * Deliberately not a free-text "subaccount code" field: the code is only
 * meaningful once Paystack has accepted the bank account, and it is
 * environment-specific — a subaccount made with a test key will not work with
 * a live key. Creating it through the API keeps those two in step.
 */
export default function SubaccountForm({ current, mode }: { current: SubaccountConfig; mode: "live" | "test" | "none" }) {
  const [banks, setBanks] = useState<Bank[] | null>(null);
  const [banksError, setBanksError] = useState<string | null>(null);

  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [percentage, setPercentage] = useState(current.percentage ?? 0);

  const [status, setStatus] = useState<"idle" | "loading" | "clear" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<SubaccountConfig | null>(current.code ? current : null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/paystack/banks");
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setBanksError(json.error ?? "Could not load the bank list from Paystack.");
          setBanks([]);
          return;
        }
        setBanks(json.banks ?? []);
      } catch {
        if (!cancelled) {
          setBanksError("Network error while loading the bank list.");
          setBanks([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/admin/paystack/subaccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankCode, accountNumber, percentageCharge: Number(percentage) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not create the subaccount.");
      setSaved({
        code: json.subaccountCode,
        name: json.accountName,
        bankName: json.bankName ?? undefined,
        accountLast4: json.accountLast4,
        percentage: json.percentageCharge,
      });
      setAccountNumber("");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function handleClear() {
    setStatus("clear");
    setError(null);
    try {
      const res = await fetch("/api/admin/paystack/subaccount", { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Could not stop the split.");
      setSaved(null);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
        Paystack mode:{" "}
        <span className={mode === "live" ? "text-elmayana" : mode === "test" ? "text-gold" : "text-bigdrip"}>
          {mode === "live" ? "LIVE — real payments" : mode === "test" ? "TEST — no real money" : "no key configured"}
        </span>
      </p>

      {mode === "test" && (
        <p className="flex items-start gap-2 border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-paper">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-gold" />
          <span>
            A payout account created here only works in test mode. Subaccount codes are environment-specific, so when
            you switch to your live key you must set this payout account up again — otherwise checkout will fail with an
            invalid subaccount.
          </span>
        </p>
      )}

      {saved ? (
        <div className="border border-line bg-ink-soft p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-paper">
            <Check className="size-4 text-elmayana" /> Splitting payments
          </p>
          <dl className="mt-3 space-y-1.5 text-xs text-muted">
            <div className="flex gap-2">
              <dt className="w-32 shrink-0 uppercase tracking-[0.08em]">Paying to</dt>
              <dd className="text-paper">{saved.name ?? "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 shrink-0 uppercase tracking-[0.08em]">Account</dt>
              <dd className="text-paper">
                {saved.bankName ? `${saved.bankName} · ` : ""}
                {saved.accountLast4 ? `••••${saved.accountLast4}` : "—"}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 shrink-0 uppercase tracking-[0.08em]">Subaccount</dt>
              <dd className="font-mono text-paper">{saved.code}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 shrink-0 uppercase tracking-[0.08em]">Main account keeps</dt>
              <dd className="text-paper">{saved.percentage ?? 0}%</dd>
            </div>
          </dl>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Every new ticket payment is split automatically; the share above settles to the subaccount on Paystack&apos;s
            schedule. Orders placed before this was set were not split.
          </p>
          <button
            type="button"
            onClick={handleClear}
            disabled={status === "clear"}
            className="mt-4 flex items-center gap-2 border border-line px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:border-bigdrip hover:text-bigdrip disabled:opacity-60"
          >
            {status === "clear" && <Loader2 className="size-3.5 animate-spin" />}
            Stop splitting payments
          </button>
        </div>
      ) : null}

      <form onSubmit={handleCreate} className="space-y-4 border border-line bg-ink-soft p-5">
        <p className="text-sm font-semibold text-paper">
          {saved ? "Replace the payout account" : "Set up payouts"}
        </p>

        {banksError && (
          <p className="flex items-start gap-2 border border-gold/40 bg-gold/10 px-3 py-2 text-xs text-paper">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-gold" />
            {banksError}
          </p>
        )}

        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Bank</span>
          <select
            required
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            disabled={!banks || banks.length === 0}
            className={`mt-1.5 ${inputClass} disabled:opacity-50`}
          >
            <option value="">
              {banks === null ? "Loading banks…" : banks.length === 0 ? "No banks available" : "Select a bank"}
            </option>
            {(banks ?? []).map((b) => (
              <option key={b.code} value={b.code} className="bg-ink text-paper">
                {b.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Account number</span>
          <input
            required
            inputMode="numeric"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit NUBAN"
            className={`mt-1.5 ${inputClass}`}
          />
          <span className="mt-1.5 block text-[11px] text-muted">
            Paystack resolves the account name first, so a typo fails here instead of paying the wrong account.
          </span>
        </label>

        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
            Share kept by the main Paystack account (%)
          </span>
          <input
            required
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={percentage}
            onChange={(e) => setPercentage(Number(e.target.value))}
            className={`mt-1.5 ${inputClass}`}
          />
          <span className="mt-1.5 block text-[11px] text-muted">
            0 means the main account keeps nothing and the full ticket amount settles to the payout account. Paystack&apos;s
            own processing fee is charged separately — confirm who bears it with one small live transaction before
            relying on it.
          </span>
        </label>

        {error && (
          <p className="flex items-start gap-2 text-xs font-medium text-bigdrip">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            {error}
          </p>
        )}
        {status === "success" && (
          <p className="flex items-center gap-1.5 text-xs font-medium text-elmayana">
            <Check className="size-3.5" /> Saved.
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading" || !bankCode || accountNumber.length !== 10}
          className="flex items-center gap-2 bg-gold px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-gold-ink transition-colors hover:bg-white disabled:opacity-50"
        >
          {status === "loading" && <Loader2 className="size-3.5 animate-spin" />}
          {saved ? "Replace payout account" : "Create payout account"}
        </button>
      </form>
    </div>
  );
}
