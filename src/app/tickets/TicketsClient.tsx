"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Minus, Plus, ShieldCheck, Ticket as TicketIcon, RefreshCcw, ArrowLeftRight } from "lucide-react";
import EventCard from "@/components/cards/EventCard";
import Placeholder from "@/components/ui/Placeholder";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import { EVENTS, formatNaira } from "@/lib/data";

export default function TicketsClient() {
  const searchParams = useSearchParams();
  const upcoming = EVENTS.filter((e) => e.status === "upcoming");
  const preselected = searchParams.get("event");
  const initial = upcoming.find((e) => e.id === preselected) ?? upcoming[0];

  const [selectedId, setSelectedId] = useState(initial?.id ?? upcoming[0]?.id);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const event = upcoming.find((e) => e.id === selectedId) ?? upcoming[0];

  function setQty(tierName: string, delta: number) {
    setQuantities((prev) => {
      const next = Math.max(0, (prev[tierName] ?? 0) + delta);
      return { ...prev, [tierName]: next };
    });
  }

  // Cheap to compute each render (a handful of tiers) — no memoization needed,
  // and `event` is re-derived via .find() every render anyway.
  const summary = (() => {
    if (!event) return { count: 0, subtotal: 0, fees: 0 };
    let count = 0;
    let subtotal = 0;
    let fees = 0;
    for (const tier of event.tiers) {
      const qty = quantities[tier.name] ?? 0;
      count += qty;
      subtotal += qty * tier.price;
      fees += qty * tier.fee;
    }
    return { count, subtotal, fees };
  })();

  function selectEvent(id: string) {
    setSelectedId(id);
    setQuantities({});
  }

  return (
    <>
      <section id="choose-show" className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10">
        <SectionHeading eyebrow="Choose a Show" title="Upcoming Events" light />
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {upcoming.map((e) => (
            <button key={e.id} onClick={() => selectEvent(e.id)} className="text-left">
              <div className={e.id === selectedId ? "ring-2 ring-ink ring-offset-2" : ""}>
                <EventCard event={e} light />
              </div>
            </button>
          ))}
        </div>
      </section>

      {event && (
        <section className="mx-auto max-w-[1400px] px-6 pb-16 lg:px-10">
          <button
            onClick={() => document.getElementById("choose-show")?.scrollIntoView()}
            className="mb-6 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-onlight hover:text-ink"
          >
            <ArrowLeft className="size-3.5" /> Back to Events
          </button>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Placeholder tone={event.labels[0]} aspect="aspect-auto h-full" />
              </div>
              <div className="mt-6 flex items-start gap-4">
                <div className="flex w-14 shrink-0 flex-col items-center bg-ink py-2 text-paper">
                  <span className="font-display text-xl font-black leading-none">{event.day}</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.06em]">{event.month}</span>
                </div>
                <div>
                  <h2 className="font-display text-2xl font-black uppercase tracking-tight">{event.name}</h2>
                  <p className="mt-1 text-sm text-muted-onlight">
                    {event.city} · {event.venue}
                  </p>
                  <p className="text-sm text-muted-onlight">
                    {event.fullDate} · {event.time}
                  </p>
                </div>
              </div>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-onlight">{event.description}</p>
            </div>

            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-black/10 bg-white p-6 sm:p-7"
            >
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-onlight">
                Select Your Tickets
              </h3>
              <div className="mt-4 divide-y divide-black/10">
                {event.tiers.map((tier) => (
                  <div key={tier.name} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-ink">{tier.name}</p>
                      <p className="text-xs text-muted-onlight">{tier.note}</p>
                      <p className="mt-1 text-sm font-bold text-ink">
                        {formatNaira(tier.price)}
                        <span className="ml-1 text-xs font-normal text-muted-onlight">+{formatNaira(tier.fee)} fee</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <button
                        onClick={() => setQty(tier.name, -1)}
                        aria-label={`Decrease ${tier.name}`}
                        className="flex size-8 items-center justify-center border border-black/15 text-ink hover:border-ink"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-4 text-center text-sm font-semibold">{quantities[tier.name] ?? 0}</span>
                      <button
                        onClick={() => setQty(tier.name, 1)}
                        aria-label={`Increase ${tier.name}`}
                        className="flex size-8 items-center justify-center border border-black/15 text-ink hover:border-ink"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {summary.count > 0 && (
                <div className="mt-4 space-y-1.5 border-t border-black/10 pt-4 text-sm">
                  <div className="flex justify-between text-muted-onlight">
                    <span>Subtotal ({summary.count} ticket{summary.count > 1 ? "s" : ""})</span>
                    <span>{formatNaira(summary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-onlight">
                    <span>Fees</span>
                    <span>{formatNaira(summary.fees)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-ink">
                    <span>Total</span>
                    <span>{formatNaira(summary.subtotal + summary.fees)}</span>
                  </div>
                </div>
              )}

              <Button variant="dark" className="mt-6 w-full" disabled={summary.count === 0}>
                Proceed to Checkout
              </Button>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted-onlight">
                <ShieldCheck className="size-3.5" /> Secure checkout — payment provider connects when the backend is live
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-black/10 pt-6 text-center">
                <div>
                  <TicketIcon className="mx-auto size-4 text-ink" />
                  <p className="mt-1.5 text-[10px] font-semibold uppercase leading-tight text-muted-onlight">
                    Instant
                    <br />
                    Delivery
                  </p>
                </div>
                <div>
                  <ArrowLeftRight className="mx-auto size-4 text-ink" />
                  <p className="mt-1.5 text-[10px] font-semibold uppercase leading-tight text-muted-onlight">
                    Easy
                    <br />
                    Transfer
                  </p>
                </div>
                <div>
                  <RefreshCcw className="mx-auto size-4 text-ink" />
                  <p className="mt-1.5 text-[10px] font-semibold uppercase leading-tight text-muted-onlight">
                    Refund
                    <br />
                    Policy
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </>
  );
}
