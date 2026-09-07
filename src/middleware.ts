import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth/token";

/**
 * Fast, edge-level gate for protected routes — redirects to /login if
 * there's no valid session cookie at all. This is a UX convenience (avoids
 * flashing protected content) and not the only line of defense: every
 * protected page/route also independently re-checks the session and role
 * server-side (see getCurrentUser() in src/lib/auth/session.ts), so a
 * middleware bypass alone can't grant access.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/verify");
  const isAccountRoute = pathname.startsWith("/account");

  if (!isAdminRoute && !isAccountRoute) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verifySessionToken(token) : null;

  if (!payload) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/account", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/verify/:path*"],
};
