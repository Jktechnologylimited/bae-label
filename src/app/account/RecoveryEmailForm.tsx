"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";

/**
 * Lets a signed-in account point password-reset emails at a different mailbox
 * — the fix for an admin whose sign-in address can't receive mail.
 *
 * The current password is required to save, so a stolen session can't quietly
 * redirect resets to an attacker's inbox and take the account over.
 */
export default function RecoveryEmailForm({ current }: { current: string }) {
  const [recoveryEmail, setRecoveryEmail] = useState(current);
  const [currentPassword, setCurrentPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(current);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/auth/recovery-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, recoveryEmail }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not save the recovery address.");
      setSaved(json.recoveryEmail ?? "");
      setRecoveryEmail(json.recoveryEmail ?? "");
      setCurrentPassword("");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="email"
        value={recoveryEmail}
        onChange={(e) => setRecoveryEmail(e.target.value)}
        placeholder="Recovery email (leave blank to remove)"
        aria-label="Recovery email address"
        className="w-full border border-black/15 bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink"
      />
      <input
        type="password"
        required
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        placeholder="Your current password, to confirm"
        aria-label="Current password, to confirm this change"
        className="w-full border border-black/15 bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink"
      />
      {error && <p className="text-xs font-medium text-bigdrip">{error}</p>}
      {status === "success" && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-elmayana">
          <Check className="size-3.5" />
          {saved ? `Saved — reset links now go to ${saved}.` : "Saved — reset links go to your sign-in address."}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="flex items-center gap-2 bg-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-gold hover:text-gold-ink disabled:opacity-60"
      >
        {status === "loading" && <Loader2 className="size-3.5 animate-spin" />}
        Save Recovery Email
      </button>
    </form>
  );
}
