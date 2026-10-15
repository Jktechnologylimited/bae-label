"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import PasswordInput from "@/components/ui/PasswordInput";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not change password.");
      setStatus("success");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <PasswordInput
        tone="light"
        required
        value={currentPassword}
        onChange={setCurrentPassword}
        placeholder="Current password"
        ariaLabel="Current password"
        autoComplete="current-password"
        className="w-full border border-black/15 bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink"
      />
      <PasswordInput
        tone="light"
        required
        minLength={8}
        value={newPassword}
        onChange={setNewPassword}
        placeholder="New password (min 8 characters)"
        ariaLabel="New password (minimum 8 characters)"
        autoComplete="new-password"
        className="w-full border border-black/15 bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink"
      />
      {error && <p className="text-xs font-medium text-bigdrip">{error}</p>}
      {status === "success" && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-elmayana">
          <Check className="size-3.5" /> Password updated.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="flex items-center gap-2 bg-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-gold hover:text-gold-ink disabled:opacity-60"
      >
        {status === "loading" && <Loader2 className="size-3.5 animate-spin" />}
        Update Password
      </button>
    </form>
  );
}
