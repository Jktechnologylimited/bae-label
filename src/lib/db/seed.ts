import { readJson, writeJson, dataFile } from "./client";
import { User } from "./schema";
import { createUser } from "./users";
import { EVENTS, ARTISTS, RELEASES, NEWS } from "@/lib/data";
import { BaeEvent, Artist, Release, NewsPost } from "@/lib/types";

const DEFAULT_ADMIN_EMAIL = "admin@bae.band";
const DEFAULT_ADMIN_PASSWORD = "BaeAdmin!2026";

let seeded = false;

/**
 * Idempotent, cheap to call often — seeds the initial admin account (only if
 * no admin exists yet) and the starting event catalog (only if none exist
 * yet). Safe to call from multiple entry points; the in-memory `seeded` flag
 * just avoids repeat file reads within a single server process. Reads/writes
 * the users and events files directly (rather than importing from
 * users.ts/events.ts) so that those modules can safely call this function
 * too, without a circular import.
 */
export async function ensureSeeded() {
  if (seeded) return;
  seeded = true;

  const usersFile = dataFile("users.json");
  const users = await readJson<User>(usersFile);
  const hasAdmin = users.some((u) => u.role === "admin");
  if (!hasAdmin) {
    await createUser({
      name: "BAE Admin",
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
      role: "admin",
    });
    console.log(
      `[seed] Created default admin account — email: ${DEFAULT_ADMIN_EMAIL}  password: ${DEFAULT_ADMIN_PASSWORD}\n` +
        `[seed] Log in at /login and change this password immediately (see /account).`
    );
  }

  // Seed the event catalog from the same content that used to be the static
  // EVENTS array — from here on, events are admin-managed via /admin/events,
  // not hardcoded.
  const eventsFile = dataFile("events.json");
  const existingEvents = await readJson<BaeEvent>(eventsFile);
  if (existingEvents.length === 0) {
    await writeJson(eventsFile, EVENTS);
  }

  // Same treatment for artists, releases and news — these are now
  // admin-managed via /admin/artists, /admin/releases, /admin/news.
  const artistsFile = dataFile("artists.json");
  const existingArtists = await readJson<Artist>(artistsFile);
  if (existingArtists.length === 0) {
    await writeJson(artistsFile, ARTISTS);
  }

  const releasesFile = dataFile("releases.json");
  const existingReleases = await readJson<Release>(releasesFile);
  if (existingReleases.length === 0) {
    await writeJson(releasesFile, RELEASES);
  }

  const newsFile = dataFile("news.json");
  const existingNews = await readJson<NewsPost>(newsFile);
  if (existingNews.length === 0) {
    await writeJson(newsFile, NEWS);
  }
}

export async function isFirstAdminStillDefault(): Promise<boolean> {
  const usersFile = dataFile("users.json");
  const users = await readJson<User>(usersFile);
  const admin = users.find((u) => u.email === DEFAULT_ADMIN_EMAIL && u.role === "admin");
  if (!admin) return false;
  // We can't reverse the hash, so this just tells the UI "this account was
  // seeded" — used to show a one-time reminder banner, not a security check.
  return true;
}
