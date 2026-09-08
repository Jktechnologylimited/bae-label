import crypto from "crypto";
import { readJson, writeJson, dataFile } from "@/lib/db/client";

export interface PasswordResetToken {
  token: string;
  userId: string;
  expiresAt: string; // ISO
  used: boolean;
  createdAt: string;
}

const FILE = dataFile("password_resets.json");
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function createResetToken(userId: string): Promise<string> {
  const tokens = await readJson<PasswordResetToken>(FILE);
  const token = crypto.randomBytes(32).toString("hex");
  tokens.push({
    token,
    userId,
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS).toISOString(),
    used: false,
    createdAt: new Date().toISOString(),
  });
  await writeJson(FILE, tokens);
  return token;
}

export async function consumeResetToken(token: string): Promise<{ userId: string } | null> {
  const tokens = await readJson<PasswordResetToken>(FILE);
  const idx = tokens.findIndex((t) => t.token === token);
  if (idx === -1) return null;

  const entry = tokens[idx];
  if (entry.used) return null;
  if (new Date(entry.expiresAt).getTime() < Date.now()) return null;

  tokens[idx] = { ...entry, used: true };
  await writeJson(FILE, tokens);
  return { userId: entry.userId };
}
