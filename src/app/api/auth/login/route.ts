import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db/users";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { toSafeUser } from "@/lib/db/schema";
import { ensureSeeded } from "@/lib/db/seed";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // No account lockout by design (that would let an attacker deny a known
  // account access); per-IP limiting still stops scripted credential stuffing.
  const limited = enforceRateLimit(req, "login", 10, 15 * 60 * 1000);
  if (limited) return limited;

  try {
    await ensureSeeded();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await getUserByEmail(email);

    // Don't reveal whether the email exists at all — but if it does and the
    // account was created via Google (no local password set), give a
    // specific, helpful message rather than a generic "incorrect password"
    // that would leave someone stuck guessing passwords that never existed.
    if (user && !user.passwordHash) {
      return NextResponse.json(
        { error: "This account uses Google sign-in. Use the \"Continue with Google\" button instead." },
        { status: 401 }
      );
    }

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    await setSessionCookie(user.id, user.role, user.sessionVersion);
    return NextResponse.json({ user: toSafeUser(user) });
  } catch (err) {
    console.error("[login] error", err);
    return NextResponse.json({ error: "Something went wrong logging in." }, { status: 500 });
  }
}
