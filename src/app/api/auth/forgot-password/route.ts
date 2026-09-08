import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getUserByEmail } from "@/lib/db/users";
import { createResetToken } from "@/lib/auth/passwordReset";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Enter your email address." }, { status: 400 });
    }

    const user = await getUserByEmail(email);

    // Always respond with the same generic message whether or not the
    // account exists — avoids leaking which emails have accounts.
    const genericResponse = NextResponse.json({
      ok: true,
      message: "If an account exists for that email, we've sent a password reset link.",
    });

    if (!user) return genericResponse;

    const token = await createResetToken(user.id);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? req.nextUrl.origin;
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log(`[forgot-password] (dry run, no RESEND_API_KEY) reset link for ${email}: ${resetUrl}`);
      return genericResponse;
    }

    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "BAE <noreply@bae.band>",
      to: email,
      subject: "Reset your BAE password",
      text: `We received a request to reset your BAE password.\n\nReset it here (expires in 1 hour): ${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
    });

    return genericResponse;
  } catch (err) {
    console.error("[forgot-password] error", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
