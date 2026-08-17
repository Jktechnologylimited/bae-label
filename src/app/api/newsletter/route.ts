import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// This route is wired for Resend but needs a live backend/database to fully
// function — see the README for what's left to connect.
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // No key configured yet — accept the request so the UI works end-to-end
      // during frontend development, without sending real email.
      console.log(`[newsletter] (dry run, no RESEND_API_KEY) would subscribe: ${email}`);
      return NextResponse.json({ ok: true, dryRun: true });
    }

    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "BAE <noreply@bae.band>",
      to: process.env.RESEND_NOTIFY_TO ?? "info@bae.band",
      subject: "New BAE newsletter signup",
      text: `New subscriber: ${email}`,
    });

    // TODO: persist the subscriber to your database / mailing list provider
    // (Resend Audiences, a CRM, etc.) once the backend is connected.

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter] error", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
