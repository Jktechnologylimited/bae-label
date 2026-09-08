"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, KeyRound } from "lucide-react";
import BaeMark from "@/components/brand/BaeMark";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
      router.push(json.role === "admin" ? "/admin" : "/account");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-1px)] items-center justify-center bg-ink px-6 py-16 text-paper">
        <div className="w-full max-w-sm text-center">
          <BaeMark size={36} className="mx-auto text-paper" />
          <h1 className="mt-6 font-display text-xl font-black uppercase tracking-tight">Invalid Link</h1>
          <p className="mt-2 text-sm text-muted">This password reset link is missing its token.</p>
          <Link href="/forgot-password" className="mt-4 inline-block text-xs font-semibold uppercase tracking-[0.1em] text-gold underline underline-offset-2">
            Request a New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-1px)] items-center justify-center bg-ink px-6 py-16 text-paper">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2">
          <BaeMark size={36} className="text-paper" />
          <span className="font-display text-lg font-black uppercase">BAE</span>
        </div>
        <h1 className="mt-6 text-center font-display text-2xl font-black uppercase tracking-tight">
          Set a New Password
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 border border-line bg-ink-soft p-6">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">New Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full border border-line bg-transparent px-4 py-3 text-sm text-paper placeholder:text-muted focus:outline-none focus:border-gold"
              placeholder="At least 8 characters"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Confirm Password</span>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1.5 w-full border border-line bg-transparent px-4 py-3 text-sm text-paper placeholder:text-muted focus:outline-none focus:border-gold"
            />
          </label>

          {error && <p className="text-xs font-medium text-bigdrip">{error}</p>}

          <button
            type="submit"
            disabled={status === "loading"}
            className="flex w-full items-center justify-center gap-2 bg-gold px-6 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-gold-ink transition-colors hover:bg-white disabled:opacity-60"
          >
            {status === "loading" ? <Loader2 className="size-3.5 animate-spin" /> : <KeyRound className="size-3.5" />}
            Set New Password
          </button>
        </form>
      </div>
    </div>
  );
}
