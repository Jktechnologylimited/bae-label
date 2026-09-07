"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Ban, Trash2 } from "lucide-react";
import { BaeEvent } from "@/lib/types";
import { Ticket } from "@/lib/ticketing/types";

const inputClass =
  "w-full border border-line bg-transparent px-3 py-2.5 text-sm text-paper placeholder:text-muted focus:outline-none focus:border-gold";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

/** Create mode: issue a new manual/comp ticket. */
export function IssueTicketForm({ events }: { events: BaeEvent[] }) {
  const router = useRouter();
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [tierName, setTierName] = useState(events[0]?.tiers[0]?.name ?? "");
  const [holderName, setHolderName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedEvent = events.find((e) => e.id === eventId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!eventId || !tierName || !holderName || !buyerEmail) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, tierName, holderName, buyerEmail }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not issue ticket.");
      router.push("/admin/tickets");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <Field label="Event">
        <select
          value={eventId}
          onChange={(e) => {
            setEventId(e.target.value);
            const ev = events.find((x) => x.id === e.target.value);
            setTierName(ev?.tiers[0]?.name ?? "");
          }}
          className={inputClass}
        >
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Ticket Tier">
        <select value={tierName} onChange={(e) => setTierName(e.target.value)} className={inputClass}>
          {selectedEvent?.tiers.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Holder Name">
        <input value={holderName} onChange={(e) => setHolderName(e.target.value)} className={inputClass} placeholder="Full name" />
      </Field>
      <Field label="Email">
        <input
          type="email"
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
          className={inputClass}
          placeholder="you@example.com"
        />
      </Field>
      <p className="text-xs text-muted">
        This creates a ₦0 comp ticket. If an account with this email already exists, the ticket is linked to it and
        will show up on their dashboard.
      </p>
      {error && <p className="text-sm font-medium text-bigdrip">{error}</p>}
      <button
        type="submit"
        disabled={loading || events.length === 0}
        className="flex items-center gap-2 bg-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-gold-ink hover:bg-white disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
        Issue Ticket
      </button>
    </form>
  );
}

/** Edit mode: update an existing ticket's holder/tier/status, or delete it. */
export function EditTicketForm({ ticket, event }: { ticket: Ticket; event?: BaeEvent }) {
  const router = useRouter();
  const [holderName, setHolderName] = useState(ticket.holderName);
  const [tierName, setTierName] = useState(ticket.tierName);
  const [status, setStatus] = useState(ticket.status);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticket.code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holderName, tierName, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not save ticket.");
      router.push("/admin/tickets");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Permanently delete ticket ${ticket.code}? This can't be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/admin/tickets/${ticket.code}`, { method: "DELETE" });
    router.push("/admin/tickets");
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="max-w-md space-y-4">
      <Field label="Ticket Code">
        <input value={ticket.code} disabled className={`${inputClass} opacity-60`} />
      </Field>
      <Field label="Event">
        <input value={event?.name ?? ticket.eventId} disabled className={`${inputClass} opacity-60`} />
      </Field>
      <Field label="Holder Name">
        <input value={holderName} onChange={(e) => setHolderName(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Ticket Tier">
        {event ? (
          <select value={tierName} onChange={(e) => setTierName(e.target.value)} className={inputClass}>
            {event.tiers.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        ) : (
          <input value={tierName} onChange={(e) => setTierName(e.target.value)} className={inputClass} />
        )}
      </Field>
      <Field label="Status">
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={inputClass}>
          <option value="valid">Valid</option>
          <option value="used">Used</option>
          <option value="void">Void</option>
        </select>
      </Field>

      {error && <p className="text-sm font-medium text-bigdrip">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-gold-ink hover:bg-white disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          Save Changes
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 border border-bigdrip/50 px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] text-bigdrip hover:bg-bigdrip/10 disabled:opacity-60"
        >
          {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
          Delete
        </button>
      </div>
      <p className="flex items-center gap-1.5 pt-1 text-xs text-muted">
        <Ban className="size-3.5" /> Deleting removes the record entirely — voiding (set Status to Void above) keeps
        it for your records but blocks entry.
      </p>
    </form>
  );
}
