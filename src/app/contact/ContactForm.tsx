"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 border border-black/10 bg-white px-6 py-20 text-center">
        <CheckCircle2 className="size-8 text-elmayana" />
        <h3 className="font-display text-lg font-bold uppercase tracking-tight text-ink">Message Sent</h3>
        <p className="max-w-sm text-sm text-muted-onlight">
          Thanks for reaching out. Our team will get back to you within 24 hours.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink underline underline-offset-4"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-black/10 bg-white p-6 sm:p-8">
      <h2 className="font-display text-xl font-black uppercase tracking-tight text-ink">Send Us a Message</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full Name" required>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your full name"
            className="w-full border border-black/15 bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink"
          />
        </Field>
        <Field label="Email Address" required>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@yourmail.com"
            className="w-full border border-black/15 bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink"
          />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Subject" required>
          <input
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="How can we help?"
            className="w-full border border-black/15 bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink"
          />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Message" required>
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Type your message here…"
            className="w-full resize-none border border-black/15 bg-white px-4 py-3 text-sm focus:outline-none focus:border-ink"
          />
        </Field>
      </div>

      {status === "error" && (
        <p className="mt-4 text-xs font-medium text-bigdrip">Something went wrong. Please try again.</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-6 flex w-full items-center justify-center gap-2 bg-ink px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-paper transition-colors hover:bg-gold hover:text-gold-ink disabled:opacity-60"
      >
        {status === "loading" ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
        Send Message
      </button>
      <p className="mt-3 text-center text-[11px] text-muted-onlight">
        Your information is safe with us. We respect your privacy.
      </p>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-onlight">
        {label} {required && <span className="text-bigdrip">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
