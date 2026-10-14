import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { updateUser } from "@/lib/db/users";
import { enforceRateLimit } from "@/lib/rateLimit";

/**
 * Sets (or clears) the alternate address that password-reset emails are sent
 * to, for accounts whose sign-in address can't receive mail.
 *
 * The current password is required even though the caller is already signed
 * in: without it, anyone who briefly got hold of a session could point resets
 * at their own inbox, reset the password, and keep the account permanently.
 * `change-password` requires it for exactly the same reason.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const limited = enforceRateLimit(req, "recovery-email", 10, 15 * 60 * 1000, user.id);
  if (limited) return limited;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const body = (raw ?? {}) as { currentPassword?: unknown; recoveryEmail?: unknown };
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  if (!currentPassword) {
    return NextResponse.json({ error: "Enter your current password to change this." }, { status: 400 });
  }
  if (!verifyPassword(currentPassword, user.passwordHash)) {
    return NextResponse.json({ error: "That password is incorrect." }, { status: 401 });
  }

  const typed = typeof body.recoveryEmail === "string" ? body.recoveryEmail.trim() : "";

  let recoveryEmail: string | undefined;
  if (typed !== "") {
    if (typed.length > 254 || !/^\S+@\S+\.\S+$/.test(typed)) {
      return NextResponse.json(
        { error: "Enter a valid email address, or leave it blank to remove the recovery address." },
        { status: 400 }
      );
    }
    if (typed.toLowerCase() === user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "That is already your sign-in address — a recovery address should be a different mailbox." },
        { status: 400 }
      );
    }
    recoveryEmail = typed;
  }

  await updateUser(user.id, { recoveryEmail });

  return NextResponse.json({ ok: true, recoveryEmail: recoveryEmail ?? null });
}
