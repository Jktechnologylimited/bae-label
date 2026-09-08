import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, getUserByGoogleId, createUser, updateUser } from "@/lib/db/users";
import { setSessionCookie } from "@/lib/auth/session";

interface GoogleTokenResponse {
  access_token: string;
  id_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}

function fail(req: NextRequest, reason: string) {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("error", reason);
  return NextResponse.redirect(loginUrl);
}

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail(req, "google_not_configured");

  const code = req.nextUrl.searchParams.get("code");
  const returnedState = req.nextUrl.searchParams.get("state");
  const oauthError = req.nextUrl.searchParams.get("error");

  if (oauthError) return fail(req, "google_denied");
  if (!code || !returnedState) return fail(req, "google_invalid_response");

  // Verify the state param matches what we set before redirecting to
  // Google, to guard against CSRF.
  const stateCookieRaw = req.cookies.get("google_oauth_state")?.value;
  if (!stateCookieRaw) return fail(req, "google_expired_state");

  let expectedState: string;
  let next: string;
  try {
    const parsed = JSON.parse(stateCookieRaw) as { state: string; next: string };
    expectedState = parsed.state;
    next = parsed.next;
  } catch {
    return fail(req, "google_expired_state");
  }
  if (returnedState !== expectedState) return fail(req, "google_state_mismatch");

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  try {
    // Exchange the authorization code for an access token.
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) {
      console.error("[google callback] token exchange failed", await tokenRes.text());
      return fail(req, "google_token_exchange_failed");
    }
    const tokens = (await tokenRes.json()) as GoogleTokenResponse;

    // Fetch the signed-in user's profile.
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!profileRes.ok) {
      console.error("[google callback] userinfo fetch failed", await profileRes.text());
      return fail(req, "google_profile_fetch_failed");
    }
    const profile = (await profileRes.json()) as GoogleUserInfo;

    if (!profile.email) return fail(req, "google_no_email");

    // Find-or-create: match by googleId first (repeat sign-ins), then by
    // email (an existing password account signing in with Google for the
    // first time gets linked rather than duplicated).
    let user = await getUserByGoogleId(profile.sub);
    if (!user) {
      user = await getUserByEmail(profile.email);
      if (user) {
        user = await updateUser(user.id, { googleId: profile.sub, avatarUrl: profile.picture });
      } else {
        user = await createUser({
          name: profile.name ?? profile.email.split("@")[0],
          email: profile.email,
          role: "customer",
          googleId: profile.sub,
          avatarUrl: profile.picture,
        });
      }
    }
    if (!user) return fail(req, "google_account_error");

    await setSessionCookie(user.id, user.role);

    const redirectTo = new URL(user.role === "admin" ? "/admin" : next || "/account", req.url);
    const res = NextResponse.redirect(redirectTo);
    res.cookies.delete("google_oauth_state");
    return res;
  } catch (err) {
    console.error("[google callback] unexpected error", err);
    return fail(req, "google_unexpected_error");
  }
}
