import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db/users";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { toSafeUser } from "@/lib/db/schema";
import { ensureSeeded } from "@/lib/db/seed";

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    await setSessionCookie(user.id, user.role);
    return NextResponse.json({ user: toSafeUser(user) });
  } catch (err) {
    console.error("[login] error", err);
    return NextResponse.json({ error: "Something went wrong logging in." }, { status: 500 });
  }
}
