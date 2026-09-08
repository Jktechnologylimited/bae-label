"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import clsx from "clsx";
import { Artist } from "@/lib/types";
import { LABELS } from "@/lib/data";
import ImageUpload from "@/components/admin/ImageUpload";

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

export default function ArtistForm({ artist }: { artist?: Artist }) {
  const router = useRouter();
  const isEdit = Boolean(artist);

  const [name, setName] = useState(artist?.name ?? "");
  const [genre, setGenre] = useState(artist?.genre ?? "");
  const [label, setLabel] = useState(artist?.label ?? LABELS[0].slug);
  const [status, setStatus] = useState<"active" | "new">(artist?.status ?? "active");
  const [bio, setBio] = useState(artist?.bio ?? "");
  const [imageUrl, setImageUrl] = useState<string | undefined>(artist?.imageUrl);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !genre) {
      setError("Name and genre are required.");
      return;
    }
    setLoading(true);
    const payload = { name, genre, label, status, bio, imageUrl };
    try {
      const res = await fetch(isEdit ? `/api/admin/artists/${artist!.id}` : "/api/admin/artists", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not save artist.");
      router.push("/admin/artists");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Artist Name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Tunde Vega" />
        </Field>
        <Field label="Genre">
          <input value={genre} onChange={(e) => setGenre(e.target.value)} className={inputClass} placeholder="Trap / Drill" />
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
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as "active" | "new")} className={inputClass}>
            <option value="active">Active</option>
            <option value="new">New</option>
          </select>
        </Field>
        <Field label="Bio" span2>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className={inputClass} placeholder="Short artist bio…" />
        </Field>
      </div>

      <ImageUpload value={imageUrl} onChange={setImageUrl} label="Artist Photo" />

      {error && <p className="text-sm font-medium text-bigdrip">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 bg-gold px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-gold-ink hover:bg-white disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
        {isEdit ? "Save Changes" : "Create Artist"}
      </button>
    </form>
  );
}
