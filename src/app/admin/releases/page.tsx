import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { listReleases } from "@/lib/db/releases";
import { LABEL_SHORT } from "@/lib/labelStyle";
import DeleteReleaseButton from "./DeleteReleaseButton";

export const metadata: Metadata = { title: "Admin — Releases" };

export default async function AdminReleasesPage() {
  const releases = await listReleases();

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight">Releases</h1>
          <p className="mt-1 text-sm text-muted">{releases.length} releases across all labels.</p>
        </div>
        <Link
          href="/admin/releases/new"
          className="flex items-center gap-1.5 bg-gold px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-gold-ink hover:bg-white"
        >
          <Plus className="size-3.5" /> New Release
        </Link>
      </div>

      <div className="mt-6 divide-y divide-line border-y border-line">
        {releases.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="font-semibold">{r.title}</p>
              <p className="text-xs text-muted">
                {r.artist} · {LABEL_SHORT[r.label]} · {r.type} · {r.tracks.length} track{r.tracks.length !== 1 ? "s" : ""} · {r.year}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/releases/${r.id}`}
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted hover:text-paper"
              >
                <Pencil className="size-3.5" /> Edit
              </Link>
              <DeleteReleaseButton id={r.id} title={r.title} />
            </div>
          </div>
        ))}
        {releases.length === 0 && <p className="py-8 text-sm text-muted">No releases yet.</p>}
      </div>
    </div>
  );
}
