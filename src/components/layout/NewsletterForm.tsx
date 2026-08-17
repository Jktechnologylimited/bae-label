"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

export default function NewsletterForm({
  variant = "dark",
  placeholder = "Enter your email address",
  ctaLabel = "Join BAE",
}: {
  variant?: "dark" | "light";
  placeholder?: string;
  ctaLabel?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  const isLight = variant === "light";

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex w-full items-stretch gap-0">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className={
            isLight
              ? "w-full border border-black/15 bg-white px-4 py-3.5 text-sm text-ink placeholder:text-muted-onlight focus:outline-none"
              : "w-full border border-line bg-transparent px-4 py-3.5 text-sm text-paper placeholder:text-muted focus:outline-none"
          }
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex shrink-0 items-center gap-2 bg-gold px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-gold-ink transition-colors hover:bg-white disabled:opacity-70"
        >
          {status === "loading" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : status === "success" ? (
            <Check className="size-3.5" />
          ) : (
            <ArrowRight className="size-3.5" />
          )}
          {status === "success" ? "Joined" : ctaLabel}
        </button>
      </form>
      {status === "success" && (
        <p className="mt-2 text-xs font-medium text-elmayana">You&apos;re on the list. Welcome to BAE.</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-xs font-medium text-bigdrip">Something went wrong. Please try again.</p>
      )}
    </div>
  );
}
