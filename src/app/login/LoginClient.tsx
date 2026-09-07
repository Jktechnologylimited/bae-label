"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, LogIn } from "lucide-react";
import BaeMark from "@/components/brand/BaeMark";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Login failed.");
      router.push(json.user.role === "admin" ? "/admin" : next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-1px)] items-center justify-center bg-ink px-6 py-16 text-paper">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2">
          <BaeMark size={36} className="text-paper" />
          <span className="font-display text-lg font-black uppercase">BAE</span>
        </div>
        <h1 className="mt-6 text-center font-display text-2xl font-black uppercase tracking-tight">Welcome Back</h1>
        <p className="mt-1 text-center text-sm text-muted">Log in to view your tickets and account.</p>

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
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full border border-line bg-transparent px-4 py-3 text-sm text-paper placeholder:text-muted focus:outline-none focus:border-gold"
              placeholder="••••••••"
            />
          </label>

          {error && <p className="text-xs font-medium text-bigdrip">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-gold px-6 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-gold-ink transition-colors hover:bg-white disabled:opacity-60"
          >
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : <LogIn className="size-3.5" />}
            Log In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-paper underline underline-offset-2">
            Sign up
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-muted">
          Bought a ticket already? Your account was created automatically — check your email for login details.
        </p>
      </div>
    </div>
  );
}
