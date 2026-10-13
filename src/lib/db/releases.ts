import { query, newId } from "./pg";
import { Release } from "@/lib/types";
import { ensureSeeded } from "./seed";

interface Row {
  data: Release;
}

export async function listReleases(): Promise<Release[]> {
  await ensureSeeded();
  const rows = await query<Row>(`SELECT data FROM releases ORDER BY id`);
  return rows.map((r) => r.data);
}

export async function getRelease(id: string): Promise<Release | undefined> {
  await ensureSeeded();
  const rows = await query<Row>(`SELECT data FROM releases WHERE id = $1`, [id]);
  return rows[0]?.data;
}

export async function createRelease(input: Omit<Release, "id">): Promise<Release> {
  const release: Release = { ...input, id: newId("release") };
  await query(`INSERT INTO releases (id, data) VALUES ($1, $2)`, [release.id, JSON.stringify(release)]);
  return release;
}

export async function updateRelease(id: string, patch: Partial<Omit<Release, "id">>): Promise<Release | undefined> {
  const existing = await getRelease(id);
  if (!existing) return undefined;
  const next: Release = { ...existing, ...patch };
  await query(`UPDATE releases SET data = $2 WHERE id = $1`, [id, JSON.stringify(next)]);
  return next;
}

export async function deleteRelease(id: string): Promise<boolean> {
  const rows = await query(`DELETE FROM releases WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}
