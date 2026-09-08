import { Suspense } from "react";
import type { Metadata } from "next";
import { ShieldCheck, Ticket as TicketIcon, Headphones } from "lucide-react";
import TicketsClient from "./TicketsClient";
import { CardGridSkeleton } from "@/components/ui/Skeleton";
import PageHero from "@/components/sections/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import Accordion from "@/components/ui/Accordion";
import { listEvents } from "@/lib/db/events";

export const metadata: Metadata = {
  title: "Get Tickets",
  description: "Secure tickets to upcoming BAE shows and label showcases.",
};

const TRUST = [
  { icon: ShieldCheck, label: "Secure", sub: "Payments" },
  { icon: TicketIcon, label: "Instant", sub: "Confirmation" },
  { icon: Headphones, label: "24/7", sub: "Support" },
];

const FAQS = [
  { question: "How do I receive my tickets?", answer: "Tickets are delivered instantly to the email address you use at checkout, along with a mobile-friendly QR code for entry." },
  { question: "What is your refund policy?", answer: "Refunds are available up to 48 hours before an event. After that window, tickets can be transferred but not refunded." },
  { question: "Can I transfer my tickets to someone else?", answer: "Yes — from your BAE account, open the ticket and choose Transfer, then enter the recipient's email address." },
  { question: "What time should I arrive?", answer: "Doors typically open one hour before the listed set time. Arriving early helps you avoid entry lines." },
];

export default async function TicketsPage() {
  const events = await listEvents();
  const testMode = !process.env.PAYSTACK_SECRET_KEY;
  return (
    <div className="bg-paper text-ink">
      <PageHero
        crumb="Get Tickets"
        title="Get Tickets"
        description="Your pass to the culture. Discover upcoming events and secure your spot."
        tone="gold"
        extra={
          <div className="mt-8 flex flex-wrap gap-6">
            {TRUST.map((t) => (
              <div key={t.label} className="flex items-center gap-2.5">
                <t.icon className="size-5 text-ink" />
                <p className="text-xs font-semibold leading-tight text-ink">
                  {t.label}
                  <br />
                  <span className="font-normal text-muted-onlight">{t.sub}</span>
                </p>
              </div>
            ))}
          </div>
        }
      />

      <Suspense fallback={<CardGridSkeleton count={4} />}>
        <TicketsClient events={events} testMode={testMode} />
      </Suspense>

      <section className="mx-auto max-w-[1400px] px-6 pb-20 pt-4 lg:px-10">
        <SectionHeading eyebrow="Need Help" title="Frequently Asked Questions" light />
        <Accordion items={FAQS} className="mt-8" />
      </section>
    </div>
  );
}
