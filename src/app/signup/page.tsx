"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";
import BaeMark from "@/components/brand/BaeMark";
import GoogleButton from "@/components/auth/GoogleButton";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Sign up failed.");
      router.push("/account");
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
        <h1 className="mt-6 text-center font-display text-2xl font-black uppercase tracking-tight">Join BAE</h1>
        <p className="mt-1 text-center text-sm text-muted">Create an account to manage your tickets.</p>

        <div className="mt-8">
          <GoogleButton />
        </div>
        <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 border border-line bg-ink-soft p-6">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Full Name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full border border-line bg-transparent px-4 py-3 text-sm text-paper placeholder:text-muted focus:outline-none focus:border-gold"
              placeholder="Your name"
            />
          </label>
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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full border border-line bg-transparent px-4 py-3 text-sm text-paper placeholder:text-muted focus:outline-none focus:border-gold"
              placeholder="At least 8 characters"
            />
          </label>

          {error && <p className="text-xs font-medium text-bigdrip">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 bg-gold px-6 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-gold-ink transition-colors hover:bg-white disabled:opacity-60"
          >
            {loading ? <Loader2 className="size-3.5 animate-spin" /> : <UserPlus className="size-3.5" />}
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-paper underline underline-offset-2">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
