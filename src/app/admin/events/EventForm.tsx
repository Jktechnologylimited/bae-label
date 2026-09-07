"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import clsx from "clsx";
import { BaeEvent } from "@/lib/types";
import { LABELS } from "@/lib/data";

type TierDraft = { name: string; price: number; fee: number; note: string };

export default function EventForm({ event }: { event?: BaeEvent }) {
  const router = useRouter();
  const isEdit = Boolean(event);

  const [name, setName] = useState(event?.name ?? "");
  const [day, setDay] = useState(event?.day ?? "01");
  const [month, setMonth] = useState(event?.month ?? "JAN");
  const [fullDate, setFullDate] = useState(event?.fullDate ?? "");
  const [time, setTime] = useState(event?.time ?? "Doors open 7:00 PM");
  const [city, setCity] = useState(event?.city ?? "");
  const [venue, setVenue] = useState(event?.venue ?? "");
  const [status, setStatus] = useState<"upcoming" | "past">(event?.status ?? "upcoming");
  const [labels, setLabels] = useState<string[]>(event?.labels ?? []);
  const [description, setDescription] = useState(event?.description ?? "");
  const [tiers, setTiers] = useState<TierDraft[]>(
    event?.tiers?.length ? event.tiers : [{ name: "General Admission", price: 25000, fee: 1500, note: "" }]
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleLabel(slug: string) {
    setLabels((prev) => (prev.includes(slug) ? prev.filter((l) => l !== slug) : [...prev, slug]));
  }

  function updateTier(i: number, patch: Partial<TierDraft>) {
    setTiers((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }

  function addTier() {
    setTiers((prev) => [...prev, { name: "", price: 0, fee: 0, note: "" }]);
  }

  function removeTier(i: number) {
    setTiers((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name || !city || !venue || labels.length === 0 || tiers.length === 0) {
      setError("Name, city, venue, at least one label and at least one ticket tier are required.");
      return;
    }

    setLoading(true);
    const payload = {
      name,
      day,
      month: month.toUpperCase(),
      fullDate,
      time,
      city,
      venue,
      labels,
      status,
      description,
      tiers: tiers.map((t) => ({ ...t, price: Number(t.price), fee: Number(t.fee) })),
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/events/${event!.id}` : "/api/admin/events", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not save event.");
      router.push("/admin/events");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Event Name" span2>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="BAE Summer Wave" />
        </Field>
        <Field label="Day">
          <input value={day} onChange={(e) => setDay(e.target.value)} className={inputClass} placeholder="28" />
        </Field>
        <Field label="Month (3 letters)">
          <input value={month} onChange={(e) => setMonth(e.target.value)} className={inputClass} placeholder="JUN" maxLength={3} />
        </Field>
        <Field label="Full Date" span2>
          <input value={fullDate} onChange={(e) => setFullDate(e.target.value)} className={inputClass} placeholder="Saturday, June 28, 2026" />
        </Field>
        <Field label="Time / Doors">
          <input value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} placeholder="Doors open 7:00 PM" />
        </Field>
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as "upcoming" | "past")} className={inputClass}>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </Field>
        <Field label="City">
          <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} placeholder="Los Angeles, CA" />
        </Field>
        <Field label="Venue">
          <input value={venue} onChange={(e) => setVenue(e.target.value)} className={inputClass} placeholder="The Novo" />
        </Field>
        <Field label="Description" span2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="A night of music, energy and culture…"
          />
        </Field>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Labels</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {LABELS.map((l) => (
            <button
              type="button"
              key={l.slug}
              onClick={() => toggleLabel(l.slug)}
              className={clsx(
                "border px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em]",
                labels.includes(l.slug) ? "border-gold bg-gold/10 text-gold" : "border-line text-muted hover:text-paper"
              )}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Ticket Tiers</p>
          <button type="button" onClick={addTier} className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-gold">
            <Plus className="size-3.5" /> Add Tier
          </button>
        </div>
        <div className="mt-3 space-y-3">
          {tiers.map((tier, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 border border-line p-3 sm:grid-cols-5">
              <input
                value={tier.name}
                onChange={(e) => updateTier(i, { name: e.target.value })}
                placeholder="Tier name"
                className={clsx(inputClass, "sm:col-span-2")}
              />
              <input
                type="number"
                value={tier.price}
                onChange={(e) => updateTier(i, { price: Number(e.target.value) })}
                placeholder="Price (₦)"
                className={inputClass}
              />
              <input
                type="number"
                value={tier.fee}
                onChange={(e) => updateTier(i, { fee: Number(e.target.value) })}
                placeholder="Fee (₦)"
                className={inputClass}
              />
              <div className="flex items-center gap-2">
                <input
                  value={tier.note}
                  onChange={(e) => updateTier(i, { note: e.target.value })}
                  placeholder="Note"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeTier(i)}
                  aria-label="Remove tier"
                  className="shrink-0 text-muted hover:text-bigdrip"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm font-medium text-bigdrip">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 bg-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-gold-ink hover:bg-white disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
        {isEdit ? "Save Changes" : "Create Event"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full border border-line bg-transparent px-3 py-2.5 text-sm text-paper placeholder:text-muted focus:outline-none focus:border-gold";

function Field({ label, span2, children }: { label: string; span2?: boolean; children: React.ReactNode }) {
  return (
    <label className={clsx("block", span2 && "sm:col-span-2")}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
