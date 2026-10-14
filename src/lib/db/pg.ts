import crypto from "crypto";
import { Pool, PoolClient, QueryResultRow } from "pg";

/**
 * Real, persistent Postgres storage (e.g. Neon) — replaces the earlier
 * flat-JSON-file MVP layer. That version worked locally but could not
 * survive on a serverless host with an ephemeral/read-only filesystem
 * (e.g. Vercel): every write vanished between requests. This module and
 * everything built on it (users, events, artists, releases, news,
 * settings, orders, tickets, password reset tokens, uploaded images)
 * fixes that by storing every record as a real row.
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

const globalForPg = globalThis as unknown as { __baePgPool?: Pool };

function getPool(): Pool {
  // Cached on globalThis rather than in a module-scope binding: Next.js
  // re-evaluates modules on hot reload, and a module-scope pool would leak a
  // new 5-connection pool per reload until the database refuses connections.
  const cached = globalForPg.__baePgPool;
  if (cached) return cached;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. This app requires a Postgres connection string (e.g. from Neon) " +
        "to store its data — see the Database section of .env.example and the README."
    );
  }
  // Neon (and most managed Postgres hosts) require TLS. A plain local Postgres
  // connection string (e.g. postgres://localhost/dev) carries no sslmode and
  // talks over an unencrypted local socket, so SSL is only enabled when the
  // connection string asks for it.
  //
  // `sslmode=verify-full` verifies the server certificate — the strict option,
  // and what .env.example recommends (Neon presents a publicly trusted
  // certificate, so no custom CA is needed). `sslmode=require` is still
  // honoured for compatibility, but note that it does NOT verify the
  // certificate, and pg warns that its meaning changes in the next major
  // version, so it is worth migrating to verify-full.
  const needsSsl = /sslmode=(require|verify-full|verify-ca|prefer)|neon\.tech/i.test(connectionString);
  const verifyCertificate = /sslmode=verify-full/i.test(connectionString);
  const created = new Pool({
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: verifyCertificate } : undefined,
    max: 5,
    // Without these, a hung connection or statement holds a pool slot forever.
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    statement_timeout: 15_000,
  });

  // An error on an idle client is an unhandled 'error' event on the pool,
  // which can take the whole process down. Log it; the pool replaces the
  // client itself.
  created.on("error", (err) => {
    console.error("[db] idle client error", err);
  });

  globalForPg.__baePgPool = created;
  return created;
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

/** A query runner. Either the pooled `query` below, or the transaction-bound
 * runner handed to `withTransaction`, so helpers can participate in a
 * transaction without knowing which one they were given. */
export type QueryFn = <T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) => Promise<T[]>;

/**
 * Runs `fn` inside a single transaction on one dedicated connection, so
 * multi-step writes either all land or none do. Every statement must go
 * through the `q` passed in — calling the pooled `query` inside `fn` would
 * run outside the transaction.
 */
export async function withTransaction<T>(fn: (q: QueryFn) => Promise<T>): Promise<T> {
  await ensureSchema();
  const client: PoolClient = await getPool().connect();
  try {
    await client.query("BEGIN");
    const q: QueryFn = async <R extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) =>
      (await client.query<R>(text, params)).rows;
    const result = await fn(q);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackErr) {
      console.error("[db] rollback failed", rollbackErr);
    }
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Opaque, unpredictable record id. Previously this was a 6-digit
 * `Math.random()` value, which both collided (a primary-key collision is a
 * 500) and made ids guessable.
 */
export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
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
      created_at TEXT NOT NULL,
      session_version INTEGER NOT NULL DEFAULT 1,
      recovery_email TEXT
    );

    -- Additive migration for databases created before session_version existed.
    -- IF NOT EXISTS makes it a no-op on every later start.
    ALTER TABLE users ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 1;

    -- Optional alternate address for password-reset emails, for accounts whose
    -- primary address can't receive mail (see /account).
    ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_email TEXT;

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

    -- Admin-uploaded images (Artists, Releases, Events, News cover art),
    -- stored as real rows rather than files on disk — see src/lib/db/images.ts
    -- and the Image uploads section of the README for why.
    CREATE TABLE IF NOT EXISTS uploaded_images (
      id TEXT PRIMARY KEY,
      content_type TEXT NOT NULL,
      data BYTEA NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // Enforce case-insensitive email uniqueness, which is what the application
  // already assumes (`getUserByEmail` matches on `lower(email)`).
  //
  // Deliberately separate from the batch above and failure-tolerant: if an
  // existing database already holds two rows differing only by case, creating
  // this index throws — and letting that failure escape would break every
  // request, which is far worse than missing the index.
  try {
    await rawQuery(`CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email))`);
  } catch (err) {
    console.error(
      "[db] Could not create the case-insensitive unique index on users(email). " +
        "Duplicate accounts differing only by email case probably exist — resolve them and restart. " +
        "The app will keep working without the index.",
      err
    );
  }
}
