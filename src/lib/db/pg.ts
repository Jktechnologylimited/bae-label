import { Pool, QueryResultRow } from "pg";

/**
 * Real, persistent Postgres storage (e.g. Neon) — replaces the earlier
 * flat-JSON-file MVP layer. That version worked locally but could not
 * survive on a serverless host with an ephemeral/read-only filesystem
 * (e.g. Vercel): every write vanished between requests. This module and
 * everything built on it (users, events, artists, releases, news,
 * settings, orders, tickets, password reset tokens) fixes that by storing
 * every record as a real row.
 *
 * Connects with DATABASE_URL (see .env.example) using the standard `pg`
 * driver over a normal Postgres connection — this works with Neon, Supabase,
 * RDS, a local Postgres, or anything else that speaks Postgres wire
 * protocol. On Neon specifically, use the **pooled** connection string
 * (the one with "-pooler" in the hostname) so serverless function
 * invocations don't exhaust Neon's direct connection limit.
 *
 * Most content tables store their record as a single `data JSONB` column
 * (keyed by the record's own id) rather than a fully normalized relational
 * schema — the application's content types (events, artists, releases,
 * news) already carry nested structures (ticket tiers, tracks, streaming
 * links) that are always read and written as one unit, so this is a
 * deliberate, honest MVP-to-production step: a real, concurrent-safe,
 * persistent database, not yet a fully normalized one. `users`, `orders`
 * and `tickets` additionally get real indexed columns for the fields
 * that're looked up outside of "by id" (email, google_id, user_id,
 * paystack_reference, order_id) so those queries don't need a JSONB scan.
 */

let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not set. This app requires a Postgres connection string (e.g. from Neon) " +
          "to store its data — see the Database section of .env.example and the README."
      );
    }
    // Neon (and most managed Postgres hosts) require TLS. A plain local
    // Postgres connection string (e.g. postgres://localhost/dev, used for
    // local development) has no sslmode and talks over a direct, unencrypted
    // connection on your own machine, so SSL is only turned on when the
    // connection string asks for it.
    const needsSsl = /sslmode=require|neon\.tech/i.test(connectionString);
    pool = new Pool({
      connectionString,
      ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
      max: 5,
    });
  }
  return pool;
}

async function rawQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await getPool().query<T>(text, params);
  return result.rows;
}

/** Runs every query through this — public API for every db/ and ticketing/
 * module. Always waits for the schema to exist first (cheap after the
 * first call; see ensureSchema below), so no call site needs to think
 * about table creation. */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  await ensureSchema();
  return rawQuery<T>(text, params);
}

export function newId(prefix: string): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}_${n}`;
}

let schemaReady: Promise<void> | undefined;

/** Idempotent (CREATE TABLE IF NOT EXISTS) and safe to call often — the
 * cached promise means concurrent callers within one server process share
 * a single in-flight initialization instead of racing. */
export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = initSchema().catch((err) => {
      // Let the next call retry instead of permanently caching a failure
      // (e.g. a transient connection error on cold start).
      schemaReady = undefined;
      throw err;
    });
  }
  return schemaReady;
}

async function initSchema() {
  await rawQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      role TEXT NOT NULL,
      google_id TEXT UNIQUE,
      avatar_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used BOOLEAN NOT NULL DEFAULT false,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS artists (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS releases (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS news (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      paystack_reference TEXT,
      data JSONB NOT NULL
    );
    CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders (user_id);
    CREATE INDEX IF NOT EXISTS orders_paystack_reference_idx ON orders (paystack_reference);

    CREATE TABLE IF NOT EXISTS tickets (
      code TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      data JSONB NOT NULL
    );
    CREATE INDEX IF NOT EXISTS tickets_order_id_idx ON tickets (order_id);
  `);
}
