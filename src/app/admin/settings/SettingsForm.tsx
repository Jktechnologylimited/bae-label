"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";
import { SiteSettings } from "@/lib/db/settings";

const inputClass =
  "w-full border border-line bg-transparent px-3 py-2.5 text-sm text-paper placeholder:text-muted focus:outline-none focus:border-gold";

export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [whatsappEnabled, setWhatsappEnabled] = useState(settings.whatsappEnabled);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [whatsappGreeting, setWhatsappGreeting] = useState(settings.whatsappGreeting);
  const [quickReplies, setQuickReplies] = useState<string[]>(settings.whatsappQuickReplies);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateReply(i: number, value: string) {
    setQuickReplies((prev) => prev.map((r, idx) => (idx === i ? value : r)));
  }
  function addReply() {
    setQuickReplies((prev) => [...prev, ""]);
  }
  function removeReply(i: number) {
    setQuickReplies((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const digitsOnly = whatsappNumber.replace(/\D/g, "");
    if (whatsappEnabled && digitsOnly.length < 10) {
      setError("Enter a valid WhatsApp number with country code, digits only (e.g. 2348012345678).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          whatsappEnabled,
          whatsappNumber: digitsOnly,
          whatsappGreeting,
          whatsappQuickReplies: quickReplies.filter((r) => r.trim()),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not save settings.");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">WhatsApp Chat Widget</p>
        <label className="mt-3 flex items-center gap-2.5 text-sm text-paper">
          <input
            type="checkbox"
            checked={whatsappEnabled}
            onChange={(e) => setWhatsappEnabled(e.target.checked)}
            className="size-4 accent-gold"
          />
          Show the WhatsApp widget on the site
        </label>
      </div>

      <label className="block">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">WhatsApp Number</span>
        <input
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          className={clsx(inputClass, "mt-1.5")}
          placeholder="2348012345678"
        />
        <p className="mt-1 text-xs text-muted">Country code first, digits only — no spaces, dashes or a leading +.</p>
      </label>

      <label className="block">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Greeting Message</span>
        <textarea
          value={whatsappGreeting}
          onChange={(e) => setWhatsappGreeting(e.target.value)}
          rows={2}
          className={clsx(inputClass, "mt-1.5")}
        />
      </label>

      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Quick Reply Prompts</span>
          <button type="button" onClick={addReply} className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-gold">
            <Plus className="size-3.5" /> Add Prompt
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {quickReplies.map((reply, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={reply} onChange={(e) => updateReply(i, e.target.value)} className={inputClass} />
              <button type="button" onClick={() => removeReply(i)} aria-label="Remove prompt" className="shrink-0 text-muted hover:text-bigdrip">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm font-medium text-bigdrip">{error}</p>}
      {saved && <p className="text-sm font-medium text-elmayana">Settings saved.</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 bg-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-gold-ink hover:bg-white disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
        Save Settings
      </button>
    </form>
  );
}
