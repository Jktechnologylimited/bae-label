"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, AlertTriangle, ScanLine, Loader2 } from "lucide-react";
import clsx from "clsx";
import BaeMark from "@/components/brand/BaeMark";

interface VerifyResponse {
  result: "ok" | "already_used" | "void" | "invalid";
  message: string;
  ticket?: { code: string; tierName: string; holderName: string };
  event?: { name: string };
}

const RESULT_STYLES: Record<VerifyResponse["result"], { bg: string; icon: typeof CheckCircle2; label: string }> = {
  ok: { bg: "bg-elmayana", icon: CheckCircle2, label: "Entry Approved" },
  already_used: { bg: "bg-gold", icon: AlertTriangle, label: "Already Used" },
  void: { bg: "bg-bigdrip", icon: XCircle, label: "Voided" },
  invalid: { bg: "bg-bigdrip", icon: XCircle, label: "Invalid Code" },
};

export default function VerifyClient() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [staff, setStaff] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResponse | null>(null);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), staff: staff || undefined }),
      });
      const json = await res.json();
      if (!res.ok && !json.result) {
        setResult({ result: "invalid", message: json.error ?? "Something went wrong." });
      } else {
        setResult(json as VerifyResponse);
      }
    } catch {
      setResult({ result: "invalid", message: "Network error — check your connection and try again." });
    } finally {
      setLoading(false);
    }
  }

  function scanNext() {
    setResult(null);
    setCode("");
  }

  const style = result ? RESULT_STYLES[result.result] : null;
  const Icon = style?.icon;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-1px)] max-w-md flex-col justify-center px-6 py-16">
      <div className="flex items-center justify-center gap-2">
        <BaeMark size={32} className="text-paper" />
        <span className="font-display text-lg font-black uppercase text-paper">BAE Door Staff</span>
      </div>

      {!result ? (
        <form onSubmit={submit} className="mt-8 border border-line bg-ink-soft p-6">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Ticket Code</span>
            <input
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="BAE-8923-01"
              className="mt-1.5 w-full border border-line bg-transparent px-4 py-3 font-mono text-lg tracking-wide text-paper placeholder:text-muted focus:outline-none focus:border-gold"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Staff Name (optional)</span>
            <input
              value={staff}
              onChange={(e) => setStaff(e.target.value)}
              placeholder="Your name"
              className="mt-1.5 w-full border border-line bg-transparent px-4 py-3 text-sm text-paper placeholder:text-muted focus:outline-none focus:border-gold"
            />
          </label>
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="mt-6 flex w-full items-center justify-center gap-2 bg-gold px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] text-gold-ink transition-colors hover:bg-white disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <ScanLine className="size-4" />}
            Verify Ticket
          </button>
          <p className="mt-4 text-center text-[11px] text-muted">
            Scanning a ticket&apos;s QR with any phone camera opens this page with the code filled in automatically.
          </p>
        </form>
      ) : (
        <div className={clsx("mt-8 flex flex-col items-center gap-3 p-8 text-center", style?.bg)}>
          {Icon && <Icon className="size-14 text-black/80" />}
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-black">{style?.label}</h2>
          <p className="text-sm font-medium text-black/80">{result.message}</p>
          {result.ticket && (
            <div className="mt-2 w-full border-t border-black/15 pt-3 text-sm text-black/80">
              <p className="font-semibold">{result.event?.name}</p>
              <p>{result.ticket.tierName} · {result.ticket.holderName}</p>
              <p className="font-mono text-xs opacity-70">{result.ticket.code}</p>
            </div>
          )}
          <button
            onClick={scanNext}
            className="mt-4 w-full bg-black/90 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-black"
          >
            Scan Next Ticket
          </button>
        </div>
      )}
    </div>
  );
}
