import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, XCircle, MapPin, Calendar, Clock } from "lucide-react";
import BaeMark from "@/components/brand/BaeMark";
import { getTicket } from "@/lib/ticketing/store";
import { generateTicketQr } from "@/lib/ticketing/qr";
import { getEvent } from "@/lib/db/events";
import clsx from "clsx";
import { LABEL_CLASSES, LABEL_SHORT } from "@/lib/labelStyle";

export const metadata: Metadata = { title: "Your Ticket" };

export default async function TicketPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ticket = await getTicket(code.toUpperCase());
  if (!ticket) notFound();

  const event = await getEvent(ticket.eventId);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const qrDataUrl = await generateTicketQr(ticket.code, baseUrl);
  const cls = event ? LABEL_CLASSES[event.labels[0]] : undefined;

  return (
    <div className="bg-ink-soft py-10 text-paper sm:py-16">
      <div className="mx-auto max-w-md px-6">
        <div className="flex items-center justify-center gap-2">
          <BaeMark size={32} className="text-paper" />
          <span className="font-display text-lg font-black uppercase">BAE</span>
        </div>

        <div className="mt-8 overflow-hidden border border-line bg-ink">
          <div className="flex items-center justify-between border-b border-dashed border-line px-6 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Ticket</p>
              <p className="font-display text-sm font-bold tracking-tight">{ticket.code}</p>
            </div>
            {ticket.status === "used" ? (
              <span className="flex items-center gap-1.5 bg-muted/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                <XCircle className="size-3.5" /> Used
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-elmayana/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-elmayana">
                <CheckCircle2 className="size-3.5" /> Valid
              </span>
            )}
          </div>

          <div className="px-6 py-6">
            {event && (
              <span className={clsx("inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white", cls?.bg)}>
                {LABEL_SHORT[event.labels[0]]}
              </span>
            )}
            <h1 className="mt-3 font-display text-2xl font-black uppercase leading-tight tracking-tight">
              {event?.name ?? "BAE Event"}
            </h1>
            {event && (
              <div className="mt-3 space-y-1.5 text-sm text-muted">
                <p className="flex items-center gap-2">
                  <Calendar className="size-3.5 shrink-0" /> {event.fullDate}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="size-3.5 shrink-0" /> {event.time}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-3.5 shrink-0" /> {event.venue}, {event.city}
                </p>
              </div>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-line-soft pt-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Ticket Type</p>
                <p className="text-sm font-bold">{ticket.tierName}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Holder</p>
                <p className="text-sm font-bold">{ticket.holderName}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 border-t border-dashed border-line bg-white px-6 py-8">
            <Image src={qrDataUrl} alt="Entry QR code" width={200} height={200} unoptimized />
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink/60">
              Present this code at entry
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Having trouble? Contact{" "}
          <a href="mailto:info@bae.band" className="underline underline-offset-2">
            info@bae.band
          </a>
        </p>
      </div>
    </div>
  );
}
