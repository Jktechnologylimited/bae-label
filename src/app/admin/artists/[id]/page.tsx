import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArtist } from "@/lib/db/artists";
import ArtistForm from "../ArtistForm";

export const metadata: Metadata = { title: "Admin — Edit Artist" };

export default async function EditArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artist = await getArtist(id);
  if (!artist) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight">Edit Artist</h1>
      <p className="mt-1 text-sm text-muted">{artist.name}</p>
      <div className="mt-6">
        <ArtistForm artist={artist} />
      </div>
    </div>
  );
}
