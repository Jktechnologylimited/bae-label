import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/db/users";
import { setSessionCookie } from "@/lib/auth/session";
import { toSafeUser } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "An account with that email already exists. Try logging in instead." }, { status: 409 });
    }

    const user = await createUser({ name, email, password, role: "customer" });
    await setSessionCookie(user.id, user.role);

    return NextResponse.json({ user: toSafeUser(user) });
  } catch (err) {
    console.error("[signup] error", err);
    return NextResponse.json({ error: "Something went wrong creating your account." }, { status: 500 });
  }
}
