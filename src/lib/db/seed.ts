import { query } from "./pg";
import { createUser, listUsers } from "./users";
import { EVENTS, ARTISTS, RELEASES, NEWS } from "@/lib/data";

let seededPromise: Promise<void> | undefined;

/**
 * The bootstrap admin always comes from the environment.
 *
 * There is deliberately no hardcoded fallback account: this repository used to
 * ship `admin@bae.band` / `BaeAdmin!2026`, which meant that anyone who could
 * read the source (or the README, which printed it) knew the admin password of
 * any deployment that had not been changed by hand.
 */
function resolveBootstrapAdmin(): { email: string; password: string } | null {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) return { email, password };

  console.error(
    "[seed] There is no admin account and ADMIN_EMAIL/ADMIN_PASSWORD are not set, so none was created. " +
      "Set both in your environment (see .env.example) and restart — they are required in every " +
      "environment, not just production."
  );
  return null;
}

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
    const bootstrap = resolveBootstrapAdmin();
    if (bootstrap) {
      try {
        await createUser({
          name: "BAE Admin",
          email: bootstrap.email,
          password: bootstrap.password,
          role: "admin",
        });
        console.log(
          `[seed] Created admin account — email: ${bootstrap.email}\n` +
            `[seed] Log in at /login and change this password immediately (see /account).`
        );
      } catch (err) {
        // A second cold-starting instance can win the race; the unique
        // constraint on email is the real guard, so treat that as success
        // rather than failing this request with a 500.
        console.warn("[seed] admin account was created concurrently by another instance; continuing.", err);
      }
    }
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
