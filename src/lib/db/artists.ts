import { readJson, writeJson, dataFile, newId } from "./client";
import { Artist } from "@/lib/types";
import { ensureSeeded } from "./seed";

const FILE = dataFile("artists.json");

export async function listArtists(): Promise<Artist[]> {
  await ensureSeeded();
  return readJson<Artist>(FILE);
}

export async function getArtist(id: string): Promise<Artist | undefined> {
  await ensureSeeded();
  const artists = await readJson<Artist>(FILE);
  return artists.find((a) => a.id === id);
}

export async function createArtist(input: Omit<Artist, "id">): Promise<Artist> {
  const artists = await readJson<Artist>(FILE);
  const artist: Artist = { ...input, id: newId("artist") };
  artists.push(artist);
  await writeJson(FILE, artists);
  return artist;
}

export async function updateArtist(id: string, patch: Partial<Omit<Artist, "id">>): Promise<Artist | undefined> {
  const artists = await readJson<Artist>(FILE);
  const idx = artists.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  artists[idx] = { ...artists[idx], ...patch };
  await writeJson(FILE, artists);
  return artists[idx];
}

export async function deleteArtist(id: string): Promise<boolean> {
  const artists = await readJson<Artist>(FILE);
  const next = artists.filter((a) => a.id !== id);
  await writeJson(FILE, next);
  return next.length !== artists.length;
}
