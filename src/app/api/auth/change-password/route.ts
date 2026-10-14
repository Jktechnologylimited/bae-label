import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, setSessionCookie } from "@/lib/auth/session";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { updateUser } from "@/lib/db/users";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  // Slows down using a stolen session to guess the current password.
  const limited = enforceRateLimit(req, "change-password", 10, 15 * 60 * 1000, user.id);
  if (limited) return limited;

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Both current and new password are required." }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }
  if (!verifyPassword(currentPassword, user.passwordHash)) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  const nextVersion = user.sessionVersion + 1;
  const updated = await updateUser(user.id, {
    passwordHash: hashPassword(newPassword),
    sessionVersion: nextVersion,
  });

  // Re-issue this browser's cookie with the new version so the person who just
  // changed the password stays signed in, while every other session for this
  // account stops working.
  await setSessionCookie(user.id, user.role, updated?.sessionVersion ?? nextVersion);

  return NextResponse.json({ ok: true });
}
