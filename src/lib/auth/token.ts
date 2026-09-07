/**
 * Pure, dependency-free session token signing/verification (HMAC-SHA256 via
 * Web Crypto). Deliberately has ZERO imports from the db/ layer (which uses
 * Node's fs/path and therefore can't run on the Edge runtime) so this file
 * alone is safe to import from middleware.ts. Node-only helpers that need a
 * database lookup (getCurrentUser, cookie get/set) live in session.ts.
 */

const COOKIE_NAME = "bae_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    console.warn(
      "[auth] SESSION_SECRET is not set — using an insecure development default. Set a real secret before deploying."
    );
    return "dev-insecure-session-secret-change-me";
  }
  return secret;
}

async function hmacKey(secret: string) {
  const enc = new TextEncoder();
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  for (const b of arr) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(b64url.length / 4) * 4, "=");
  const str = atob(b64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

export interface SessionPayload {
  userId: string;
  role: "admin" | "customer";
  exp: number; // unix seconds
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const key = await hmacKey(getSecret());
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return `${body}.${toBase64Url(sig)}`;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const key = await hmacKey(getSecret());
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(sig) as BufferSource,
      new TextEncoder().encode(body) as BufferSource
    );
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createSessionCookieValue(userId: string, role: "admin" | "customer") {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  return signSession({ userId, role, exp });
}

export { COOKIE_NAME, MAX_AGE_SECONDS };
