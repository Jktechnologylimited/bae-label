import { query, newId } from "./pg";
import { Artist } from "@/lib/types";
import { ensureSeeded } from "./seed";

interface Row {
  data: Artist;
}

export async function listArtists(): Promise<Artist[]> {
  await ensureSeeded();
  const rows = await query<Row>(`SELECT data FROM artists ORDER BY id`);
  return rows.map((r) => r.data);
}

export async function getArtist(id: string): Promise<Artist | undefined> {
  await ensureSeeded();
  const rows = await query<Row>(`SELECT data FROM artists WHERE id = $1`, [id]);
  return rows[0]?.data;
}

export async function createArtist(input: Omit<Artist, "id">): Promise<Artist> {
  const artist: Artist = { ...input, id: newId("artist") };
  await query(`INSERT INTO artists (id, data) VALUES ($1, $2)`, [artist.id, JSON.stringify(artist)]);
  return artist;
}

export async function updateArtist(id: string, patch: Partial<Omit<Artist, "id">>): Promise<Artist | undefined> {
  const existing = await getArtist(id);
  if (!existing) return undefined;
  const next: Artist = { ...existing, ...patch };
  await query(`UPDATE artists SET data = $2 WHERE id = $1`, [id, JSON.stringify(next)]);
  return next;
}

export async function deleteArtist(id: string): Promise<boolean> {
  const rows = await query(`DELETE FROM artists WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}
