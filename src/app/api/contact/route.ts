import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // Unauthenticated endpoint that sends mail — without this it is an open
  // relay into the site owner's inbox.
  const limited = enforceRateLimit(req, "contact", 5, 60 * 60 * 1000);
  if (limited) return limited;

  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (typeof name !== "string" || typeof email !== "string" || typeof subject !== "string" || typeof message !== "string") {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }
    if (name.length > 120 || email.length > 254 || subject.length > 200 || message.length > 5000) {
      return NextResponse.json({ error: "That message is too long — please shorten it and try again." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log(`[contact] (dry run, no RESEND_API_KEY) message from ${name} <${email}>: ${subject}`);
      return NextResponse.json({ ok: true, dryRun: true });
    }

    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "BAE <noreply@bae.band>",
      to: process.env.RESEND_NOTIFY_TO ?? "info@bae.band",
      replyTo: email,
      subject: `[BAE Contact] ${subject}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] error", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
