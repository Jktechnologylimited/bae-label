"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import Select from "@/components/ui/Select";
import EventCard from "@/components/cards/EventCard";
import NewsletterBand from "@/components/sections/NewsletterBand";
import LabelStrip from "@/components/sections/LabelStrip";
import SectionHeading from "@/components/ui/SectionHeading";
import Placeholder from "@/components/ui/Placeholder";
import { EVENTS, LABELS, VENUES } from "@/lib/data";
import { LabelSlug } from "@/lib/types";

export default function EventsClient() {
  const [query, setQuery] = useState("");
  const [label, setLabel] = useState("all");

  const upcoming = useMemo(
    () =>
      EVENTS.filter((e) => e.status === "upcoming")
        .filter((e) => (label === "all" ? true : e.labels.includes(label as LabelSlug)))
        .filter((e) => e.name.toLowerCase().includes(query.toLowerCase()) || e.city.toLowerCase().includes(query.toLowerCase())),
    [query, label]
  );
  const past = EVENTS.filter((e) => e.status === "past");

  return (
    <div className="bg-paper text-ink">
      <PageHero
        crumb="Events"
        title="Events"
        description="Live experiences. Real energy. Be part of the movement — from intimate club shows to festival stages."
        primaryCta="Browse Events"
        primaryHref="#upcoming"
        secondaryCta="Get Tickets"
        secondaryHref="/tickets"
        tone="ag20"
      />

      <section className="mx-auto max-w-[1400px] px-6 pt-8 lg:px-10">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-onlight" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events, artists, venues…"
              className="w-full border border-black/15 bg-white py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-ink"
            />
          </div>
          <div className="w-full sm:w-56">
            <Select
              label="Label"
              value={label}
              onChange={setLabel}
              options={[{ label: "All Labels", value: "all" }, ...LABELS.map((l) => ({ label: l.name, value: l.slug }))]}
            />
          </div>
        </div>
      </section>

      <section id="upcoming" className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10">
        <SectionHeading eyebrow="Don't Miss Out" title="Upcoming Events" light />
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {upcoming.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <EventCard event={event} light />
            </motion.div>
          ))}
          {upcoming.length === 0 && (
            <p className="col-span-full border border-dashed border-black/15 py-16 text-center text-sm text-muted-onlight">
              No upcoming events match your search right now.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-12 lg:px-10">
        <SectionHeading eyebrow="Look Back" title="Past Events" light />
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {past.map((event) => (
            <EventCard key={event.id} event={event} light />
          ))}
        </div>
      </section>

      <NewsletterBand
        title="Never Miss a Show"
        description="Get early access to tickets, exclusive events and special announcements."
      />

      <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
        <SectionHeading eyebrow="Featured Venues" title="Where We Play" light />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {VENUES.map((v) => (
            <div key={v.name} className="group cursor-pointer">
              <Placeholder tone="ink" aspect="aspect-square" pattern="diagonal" />
              <p className="mt-2 truncate text-xs font-semibold text-ink">{v.name}</p>
              <p className="flex items-center gap-1 truncate text-[11px] text-muted-onlight">
                <MapPin className="size-3 shrink-0" />
                {v.city}
              </p>
            </div>
          ))}
        </div>
      </section>

      <LabelStrip title="Browse Events by Label" />
    </div>
  );
}
