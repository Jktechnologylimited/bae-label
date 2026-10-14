#!/usr/bin/env node
/**
 * Lockout recovery — sets a new password for an account, straight in the
 * database, and invalidates that account's existing sessions.
 *
 *   node --env-file=.env.local scripts/reset-password.mjs you@example.com
 *
 * Use this when you cannot get a reset email: the recovery address only helps
 * if mail is actually being delivered, and /forgot-password needs RESEND_API_KEY
 * and a verified sending domain. This needs nothing but database access.
 *
 * A random password is generated and printed once, so nothing sensitive is
 * typed (and nothing lands in your shell history). Log in, then change it from
 * /account if you'd prefer your own.
 */

import crypto from "crypto";
import pg from "pg";

const email = process.argv[2];

if (!email) {
  console.error("usage: node --env-file=.env.local scripts/reset-password.mjs <email>");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Run with: node --env-file=.env.local scripts/reset-password.mjs <email>");
  process.exit(1);
}

const password = crypto.randomBytes(18).toString("base64url");
const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(password, salt, 64).toString("hex");
const stored = `scrypt:${salt}:${hash}`;

const pool = new pg.Pool({
  connectionString,
  ssl: /sslmode=verify-full|neon\.tech/i.test(connectionString) ? { rejectUnauthorized: true } : undefined,
  max: 1,
});

try {
  const result = await pool.query(
    `UPDATE users
        SET password_hash = $1, session_version = session_version + 1
      WHERE lower(email) = lower($2)
      RETURNING email, role`,
    [stored, email]
  );

  if (result.rowCount !== 1) {
    console.error(`No account found with the email ${email}.`);
    process.exitCode = 1;
  } else {
    const { email: actual, role } = result.rows[0];
    console.log(`\nPassword reset for ${actual} (${role}). All existing sessions for it are now invalid.\n`);
    console.log(`  New password: ${password}\n`);
    console.log("Log in, then change it from /account if you'd rather use your own.\n");
  }
} catch (err) {
  console.error("Could not reset the password:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
