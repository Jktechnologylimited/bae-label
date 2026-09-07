import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { listArtists } from "@/lib/db/artists";
import { LABEL_SHORT } from "@/lib/labelStyle";
import DeleteArtistButton from "./DeleteArtistButton";

export const metadata: Metadata = { title: "Admin — Artists" };

export default async function AdminArtistsPage() {
  const artists = await listArtists();

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight">Artists</h1>
          <p className="mt-1 text-sm text-muted">{artists.length} artists across all labels.</p>
        </div>
        <Link
          href="/admin/artists/new"
          className="flex items-center gap-1.5 bg-gold px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-gold-ink hover:bg-white"
        >
          <Plus className="size-3.5" /> New Artist
        </Link>
      </div>

      <div className="mt-6 divide-y divide-line border-y border-line">
        {artists.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="font-semibold">{a.name}</p>
              <p className="text-xs text-muted">
                {a.genre} · {LABEL_SHORT[a.label]} · <span className="capitalize">{a.status}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/artists/${a.id}`}
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted hover:text-paper"
              >
                <Pencil className="size-3.5" /> Edit
              </Link>
              <DeleteArtistButton id={a.id} name={a.name} />
            </div>
          </div>
        ))}
        {artists.length === 0 && <p className="py-8 text-sm text-muted">No artists yet.</p>}
      </div>
    </div>
  );
}
