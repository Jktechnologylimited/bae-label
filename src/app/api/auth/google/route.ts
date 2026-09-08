import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Starts the Google OAuth 2.0 authorization-code flow. Redirects the
 * browser to Google's consent screen; Google redirects back to
 * /api/auth/google/callback with a `code` to exchange for the user's
 * identity.
 *
 * Requires GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (see .env.example). This
 * sandbox has no network access to accounts.google.com, so this flow is
 * written to Google's documented OAuth 2.0 spec but hasn't been exercised
 * against the live endpoint — test it with real credentials before relying
 * on it. If the env vars aren't set, this route fails clearly instead of
 * silently redirecting somewhere broken.
 */
export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("error", "google_not_configured");
    return NextResponse.redirect(loginUrl);
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  // CSRF protection: a random value we can verify came back unmodified.
  const state = crypto.randomBytes(24).toString("hex");

  // Where to send the user after a successful login — preserved through the
  // round trip via the state cookie's paired "next" value.
  const next = req.nextUrl.searchParams.get("next") ?? "/account";

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("access_type", "online");
  authUrl.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(authUrl.toString());
  res.cookies.set("google_oauth_state", JSON.stringify({ state, next }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes — this is a short-lived CSRF token, not a session
  });
  return res;
}
