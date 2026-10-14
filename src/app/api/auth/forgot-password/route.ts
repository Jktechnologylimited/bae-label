import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getUserByEmail, getUserByRecoveryEmail } from "@/lib/db/users";
import { createResetToken } from "@/lib/auth/passwordReset";
import { siteBaseUrl } from "@/lib/site";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // Unauthenticated and sends email — limits both enumeration attempts and
  // using the site as a mail relay against a third party's inbox.
  const limited = enforceRateLimit(req, "forgot-password", 5, 15 * 60 * 1000);
  if (limited) return limited;

  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Enter your email address." }, { status: 400 });
    }

    // Accept either the sign-in address or the alternate recovery address set
    // from /account, so someone who has forgotten their password *and* which
    // mailbox they used can still get back in.
    const user = (await getUserByEmail(email)) ?? (await getUserByRecoveryEmail(email));

    // Always respond with the same generic message whether or not the
    // account exists — avoids leaking which emails have accounts.
    const genericResponse = NextResponse.json({
      ok: true,
      message: "If an account exists for that email, we've sent a password reset link.",
    });

    if (!user) return genericResponse;

    // Deliver to the recovery address when one is configured: the whole point
    // of setting it is that the sign-in address may not be reachable.
    const destination = user.recoveryEmail?.trim() || user.email;

    const token = await createResetToken(user.id);
    const baseUrl = await siteBaseUrl();
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      if (process.env.NODE_ENV === "production") {
        console.error(
          "[forgot-password] RESEND_API_KEY is not set — the reset email was NOT sent. " +
            "Password reset cannot work in production without it."
        );
      } else {
        console.log(
          `[forgot-password] (dry run, no RESEND_API_KEY) reset link would be sent to ${destination}: ${resetUrl}`
        );
      }
      return genericResponse;
    }

    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "BAE <noreply@bae.band>",
      to: destination,
      subject: "Reset your BAE password",
      text: `We received a request to reset your BAE password.\n\nReset it here (expires in 1 hour): ${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
    });

    return genericResponse;
  } catch (err) {
    console.error("[forgot-password] error", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
