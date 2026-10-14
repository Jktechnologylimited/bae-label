import { NextRequest, NextResponse } from "next/server";
import { consumeResetToken } from "@/lib/auth/passwordReset";
import { hashPassword } from "@/lib/auth/password";
import { updateUser, getUserById } from "@/lib/db/users";
import { setSessionCookie } from "@/lib/auth/session";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // Slows down brute-forcing reset tokens.
  const limited = enforceRateLimit(req, "reset-password", 10, 15 * 60 * 1000);
  if (limited) return limited;

  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) {
      return NextResponse.json({ error: "Missing token or new password." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const result = await consumeResetToken(token);
    if (!result) {
      return NextResponse.json({ error: "This reset link is invalid or has expired. Request a new one." }, { status: 400 });
    }

    const user = await getUserById(result.userId);
    if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

    // Bumping the session version invalidates every session issued before this
    // reset — including one an attacker might be holding after a compromise.
    const nextVersion = user.sessionVersion + 1;
    await updateUser(user.id, { passwordHash: hashPassword(newPassword), sessionVersion: nextVersion });
    await setSessionCookie(user.id, user.role, nextVersion);

    return NextResponse.json({ ok: true, role: user.role });
  } catch (err) {
    console.error("[reset-password] error", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
