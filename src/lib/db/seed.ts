import { query } from "./pg";
import { createUser, listUsers } from "./users";
import { EVENTS, ARTISTS, RELEASES, NEWS } from "@/lib/data";

const DEFAULT_ADMIN_EMAIL = "admin@bae.band";
const DEFAULT_ADMIN_PASSWORD = "BaeAdmin!2026";

let seededPromise: Promise<void> | undefined;

/**
 * Idempotent, cheap to call often — seeds the initial admin account (only if
 * no admin exists yet) and the starting catalog content (only if each table
 * is empty). The cached promise (rather than a plain boolean flag) means
 * concurrent calls within one server process share a single in-flight run
 * instead of racing each other.
 */
export function ensureSeeded(): Promise<void> {
  if (!seededPromise) {
    seededPromise = doSeed().catch((err) => {
      seededPromise = undefined;
      throw err;
    });
  }
  return seededPromise;
}

async function doSeed() {
  const users = await listUsers();
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

  // Seed the catalog content from what used to be the static EVENTS /
  // ARTISTS / RELEASES / NEWS arrays — from here on, this content is
  // admin-managed via /admin/*, not hardcoded. Only runs once per table
  // (checked via a row-count probe), and ON CONFLICT DO NOTHING means a
  // second, concurrent seed attempt can never duplicate rows.
  await seedTable("events", EVENTS);
  await seedTable("artists", ARTISTS);
  await seedTable("releases", RELEASES);
  await seedTable("news", NEWS);
}

async function seedTable(table: "events" | "artists" | "releases" | "news", rows: { id: string }[]) {
  const existing = await query<{ id: string }>(`SELECT id FROM ${table} LIMIT 1`);
  if (existing.length > 0) return;
  for (const row of rows) {
    await query(`INSERT INTO ${table} (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`, [
      row.id,
      JSON.stringify(row),
    ]);
  }
}

export async function isFirstAdminStillDefault(): Promise<boolean> {
  const users = await listUsers();
  const admin = users.find((u) => u.email === DEFAULT_ADMIN_EMAIL && u.role === "admin");
  if (!admin) return false;
  // We can't reverse the hash, so this just tells the UI "this account was
  // seeded" — used to show a one-time reminder banner, not a security check.
  return true;
}
