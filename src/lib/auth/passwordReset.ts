import crypto from "crypto";
import { query } from "@/lib/db/pg";

export interface PasswordResetToken {
  token: string;
  userId: string;
  expiresAt: string; // ISO
  used: boolean;
  createdAt: string;
}

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function createResetToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();
  const createdAt = new Date().toISOString();
  await query(
    `INSERT INTO password_reset_tokens (token, user_id, expires_at, used, created_at)
     VALUES ($1, $2, $3, false, $4)`,
    [token, userId, expiresAt, createdAt]
  );
  return token;
}

export async function consumeResetToken(token: string): Promise<{ userId: string } | null> {
  // One conditional statement, so two concurrent requests presenting the same
  // token cannot both succeed. This used to be SELECT → check → UPDATE across
  // two separate pooled connections, which both callers could pass (M1).
  const rows = await query<{ user_id: string }>(
    `UPDATE password_reset_tokens
        SET used = true
      WHERE token = $1
        AND used = false
        AND expires_at::timestamptz > now()
      RETURNING user_id`,
    [token]
  );
  return rows[0] ? { userId: rows[0].user_id } : null;
}
