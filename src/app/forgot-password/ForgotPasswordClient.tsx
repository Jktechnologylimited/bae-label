"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import BaeMark from "@/components/brand/BaeMark";

export default function ForgotPasswordClient() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-1px)] items-center justify-center bg-ink px-6 py-16 text-paper">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2">
          <BaeMark size={36} className="text-paper" />
          <span className="font-display text-lg font-black uppercase">BAE</span>
        </div>
        <h1 className="mt-6 text-center font-display text-2xl font-black uppercase tracking-tight">
          Reset Your Password
        </h1>
        <p className="mt-1 text-center text-sm text-muted">
          Enter your email and we&apos;ll send you a link to reset it.
        </p>

        {status === "sent" ? (
          <div className="mt-8 flex flex-col items-center gap-3 border border-line bg-ink-soft p-6 text-center">
            <Mail className="size-8 text-gold" />
            <p className="text-sm text-paper">
              If an account exists for <strong className="font-semibold">{email}</strong>, a reset link is on its
              way. It expires in 1 hour.
            </p>
            <Link href="/login" className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-gold underline underline-offset-2">
              Back to Log In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 border border-line bg-ink-soft p-6">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full border border-line bg-transparent px-4 py-3 text-sm text-paper placeholder:text-muted focus:outline-none focus:border-gold"
                placeholder="you@example.com"
              />
            </label>
            {error && <p className="text-xs font-medium text-bigdrip">{error}</p>}
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex w-full items-center justify-center gap-2 bg-gold px-6 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-gold-ink transition-colors hover:bg-white disabled:opacity-60"
            >
              {status === "loading" ? <Loader2 className="size-3.5 animate-spin" /> : <Mail className="size-3.5" />}
              Send Reset Link
            </button>
          </form>
        )}

        <Link href="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted hover:text-paper">
          <ArrowLeft className="size-3.5" /> Back to Log In
        </Link>
      </div>
    </div>
  );
}
