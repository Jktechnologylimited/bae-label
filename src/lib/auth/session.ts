import { cookies } from "next/headers";
import { getUserById } from "@/lib/db/users";
import { User } from "@/lib/db/schema";
import { ensureSeeded } from "@/lib/db/seed";
import { COOKIE_NAME, MAX_AGE_SECONDS, createSessionCookieValue, verifySessionToken } from "./token";

export { verifySessionToken } from "./token";

// ---- Server Component / Route Handler helpers (Node runtime, uses next/headers) ----

export async function setSessionCookie(userId: string, role: "admin" | "customer") {
  const token = await createSessionCookieValue(userId, role);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  await ensureSeeded();
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  const user = await getUserById(payload.userId);
  return user ?? null;
}
