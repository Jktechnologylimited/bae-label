"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";
import { Release, ReleaseType, Track } from "@/lib/types";
import { LABELS } from "@/lib/data";

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

export default function ReleaseForm({ release }: { release?: Release }) {
  const router = useRouter();
  const isEdit = Boolean(release);

  const [title, setTitle] = useState(release?.title ?? "");
  const [artist, setArtist] = useState(release?.artist ?? "");
  const [label, setLabel] = useState(release?.label ?? LABELS[0].slug);
  const [type, setType] = useState<ReleaseType>(release?.type ?? "Single");
  const [year, setYear] = useState(release?.year ?? new Date().getFullYear());
  const [blurb, setBlurb] = useState(release?.blurb ?? "");
  const [tracks, setTracks] = useState<Track[]>(release?.tracks?.length ? release.tracks : [{ title: "", duration: "03:00" }]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateTrack(i: number, patch: Partial<Track>) {
    setTracks((prev) => prev.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }
  function addTrack() {
    setTracks((prev) => [...prev, { title: "", duration: "03:00" }]);
  }
  function removeTrack(i: number) {
    setTracks((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title || !artist || tracks.some((t) => !t.title)) {
      setError("Title, artist and a title for every track are required.");
      return;
    }
    setLoading(true);
    const payload = { title, artist, label, type, year: Number(year), blurb, tracks, trackCount: tracks.length };
    try {
      const res = await fetch(isEdit ? `/api/admin/releases/${release!.id}` : "/api/admin/releases", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not save release.");
      router.push("/admin/releases");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Release Title" span2>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Concrete Halo" />
        </Field>
        <Field label="Artist">
          <input value={artist} onChange={(e) => setArtist(e.target.value)} className={inputClass} placeholder="Tunde Vega" />
        </Field>
        <Field label="Label">
          <select value={label} onChange={(e) => setLabel(e.target.value as typeof label)} className={inputClass}>
            {LABELS.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Type">
          <select value={type} onChange={(e) => setType(e.target.value as ReleaseType)} className={inputClass}>
            <option value="Single">Single</option>
            <option value="EP">EP</option>
            <option value="Album">Album</option>
          </select>
        </Field>
        <Field label="Year">
          <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className={inputClass} />
        </Field>
        <Field label="Blurb" span2>
          <textarea value={blurb} onChange={(e) => setBlurb(e.target.value)} rows={2} className={inputClass} placeholder="One line about this release…" />
        </Field>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Tracklist</p>
          <button type="button" onClick={addTrack} className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-gold">
            <Plus className="size-3.5" /> Add Track
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {tracks.map((track, i) => (
            <div key={i} className="flex items-center gap-2 border border-line p-2.5">
              <span className="w-5 shrink-0 text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
              <input
                value={track.title}
                onChange={(e) => updateTrack(i, { title: e.target.value })}
                placeholder="Track title"
                className={clsx(inputClass, "flex-1")}
              />
              <input
                value={track.duration}
                onChange={(e) => updateTrack(i, { duration: e.target.value })}
                placeholder="03:21"
                className={clsx(inputClass, "w-24 shrink-0")}
              />
              <button type="button" onClick={() => removeTrack(i)} aria-label="Remove track" className="shrink-0 text-muted hover:text-bigdrip">
                <Trash2 className="size-4" />
              </button>
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
        {isEdit ? "Save Changes" : "Create Release"}
      </button>
    </form>
  );
}
