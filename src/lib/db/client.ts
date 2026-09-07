import { promises as fs } from "fs";
import path from "path";

/**
 * Same lightweight JSON-file data layer used for ticketing (see
 * src/lib/ticketing/store.ts), generalized for users and events too, so
 * everything lives under one .data/ directory.
 *
 * This is a real, working, persisted store — not mock in-memory data — but
 * it's still a flat-file MVP layer, not a production database. It will NOT
 * survive on a serverless host with an ephemeral filesystem (e.g. Vercel).
 * Swap this module for Postgres/Supabase/etc. before going live; every
 * function across the db/ and ticketing/ modules is already async so call
 * sites won't need to change.
 */

const DATA_DIR = path.join(process.cwd(), ".data");

async function ensureFile(file: string) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(file);
  } catch {
    await fs.writeFile(file, "[]", "utf-8");
  }
}

export function dataFile(name: string) {
  return path.join(DATA_DIR, name);
}

export async function readJson<T>(file: string): Promise<T[]> {
  await ensureFile(file);
  const raw = await fs.readFile(file, "utf-8");
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export async function writeJson<T>(file: string, data: T[]) {
  await ensureFile(file);
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

export function newId(prefix: string): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}_${n}`;
}
