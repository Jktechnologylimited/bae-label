"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Play } from "lucide-react";
import clsx from "clsx";
import Eyebrow from "@/components/ui/Eyebrow";
import Placeholder from "@/components/ui/Placeholder";
import { LABEL_CLASSES } from "@/lib/labelStyle";
import { BaeEvent, Artist, Release } from "@/lib/types";

function Column({
  eyebrow,
  title,
  action,
  actionHref,
  delay,
  children,
}: {
  eyebrow: string;
  title: string;
  action: string;
  actionHref: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h3 className="mt-2 font-display text-xl font-black uppercase tracking-tight">{title}</h3>
        </div>
        <Link
          href={actionHref}
          className="mt-1 flex shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted transition-colors hover:text-gold"
        >
          {action}
          <ArrowRight className="size-3" />
        </Link>
      </div>
      <div className="mt-6 flex-1">{children}</div>
    </motion.div>
  );
}

export default function QuickHighlights({
  events,
  artists,
  releases,
}: {
  events: BaeEvent[];
  artists: Artist[];
  releases: Release[];
}) {
  const featuredArtists = artists.slice(0, 5);
  const latestReleases = releases.slice(0, 4);
  const upcomingEvents = events.filter((e) => e.status === "upcoming").slice(0, 3);

  return (
    <section className="border-b border-line-soft py-16 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8">
          <Column eyebrow="Featured Artists" title="The Future Is Ours" action="View All" actionHref="/artists" delay={0}>
            <div className="flex flex-wrap gap-4">
              {featuredArtists.map((artist) => {
                const cls = LABEL_CLASSES[artist.label];
                return (
                  <Link key={artist.id} href={`/artists#${artist.id}`} className="group flex flex-col items-center gap-2 text-center">
                    <div className={clsx("size-16 overflow-hidden rounded-full border-2 p-0.5", cls.border)}>
                      <Placeholder tone={artist.label} aspect="aspect-square" className="rounded-full" pattern="none" />
                    </div>
                    <span className="max-w-[70px] truncate text-[11px] font-semibold text-paper/90">{artist.name}</span>
                  </Link>
                );
              })}
            </div>
          </Column>

          <Column eyebrow="Latest Releases" title="Fresh Off the Press" action="View All" actionHref="/releases" delay={0.08}>
            <div className="grid grid-cols-2 gap-3">
              {latestReleases.map((r) => (
                <button key={r.id} className="group text-left">
                  <div className="relative overflow-hidden">
                    <Placeholder tone={r.label} aspect="aspect-square" pattern="grid" />
                    <span className="absolute bottom-2 right-2 flex size-7 items-center justify-center rounded-full bg-gold text-gold-ink opacity-0 transition-opacity group-hover:opacity-100">
                      <Play className="size-3 translate-x-[1px] fill-current" />
                    </span>
                  </div>
                  <p className="mt-2 truncate text-xs font-semibold uppercase tracking-tight text-paper">{r.title}</p>
                  <p className="truncate text-[11px] text-muted">{r.artist}</p>
                </button>
              ))}
            </div>
          </Column>

          <Column eyebrow="Upcoming Events" title="Don't Miss Out" action="View All" actionHref="/events" delay={0.16}>
            <div className="flex flex-col divide-y divide-line-soft border-y border-line-soft">
              {upcomingEvents.map((event) => {
                const cls = LABEL_CLASSES[event.labels[0]];
                return (
                  <div key={event.id} className="flex items-center gap-3 py-3.5">
                    <div className="flex w-11 shrink-0 flex-col items-center bg-ink-elevated py-1.5">
                      <span className="font-display text-sm font-black leading-none">{event.day}</span>
                      <span className="text-[9px] font-bold uppercase tracking-[0.06em] text-muted">{event.month}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold uppercase tracking-tight text-paper">{event.name}</p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted">
                        <MapPin className="size-3 shrink-0" />
                        {event.city}
                      </p>
                    </div>
                    <Link
                      href={`/tickets?event=${event.id}`}
                      className={clsx("shrink-0 border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em]", cls.border, cls.text)}
                    >
                      Tickets
                    </Link>
                  </div>
                );
              })}
            </div>
          </Column>
        </div>
      </div>
    </section>
  );
}
