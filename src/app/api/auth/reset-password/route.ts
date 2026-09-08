import { NextRequest, NextResponse } from "next/server";
import { consumeResetToken } from "@/lib/auth/passwordReset";
import { hashPassword } from "@/lib/auth/password";
import { updateUser, getUserById } from "@/lib/db/users";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
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

    await updateUser(user.id, { passwordHash: hashPassword(newPassword) });
    await setSessionCookie(user.id, user.role);

    return NextResponse.json({ ok: true, role: user.role });
  } catch (err) {
    console.error("[reset-password] error", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
