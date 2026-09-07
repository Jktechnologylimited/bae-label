import type { Metadata } from "next";
import ArtistForm from "../ArtistForm";

export const metadata: Metadata = { title: "Admin — New Artist" };

export default function NewArtistPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight">New Artist</h1>
      <p className="mt-1 text-sm text-muted">This appears immediately on /artists once saved.</p>
      <div className="mt-6">
        <ArtistForm />
      </div>
    </div>
  );
}
