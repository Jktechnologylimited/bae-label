import { readJson, writeJson, dataFile, newId } from "./client";
import { Release } from "@/lib/types";
import { ensureSeeded } from "./seed";

const FILE = dataFile("releases.json");

export async function listReleases(): Promise<Release[]> {
  await ensureSeeded();
  return readJson<Release>(FILE);
}

export async function getRelease(id: string): Promise<Release | undefined> {
  await ensureSeeded();
  const releases = await readJson<Release>(FILE);
  return releases.find((r) => r.id === id);
}

export async function createRelease(input: Omit<Release, "id">): Promise<Release> {
  const releases = await readJson<Release>(FILE);
  const release: Release = { ...input, id: newId("release") };
  releases.push(release);
  await writeJson(FILE, releases);
  return release;
}

export async function updateRelease(id: string, patch: Partial<Omit<Release, "id">>): Promise<Release | undefined> {
  const releases = await readJson<Release>(FILE);
  const idx = releases.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  releases[idx] = { ...releases[idx], ...patch };
  await writeJson(FILE, releases);
  return releases[idx];
}

export async function deleteRelease(id: string): Promise<boolean> {
  const releases = await readJson<Release>(FILE);
  const next = releases.filter((r) => r.id !== id);
  await writeJson(FILE, next);
  return next.length !== releases.length;
}
