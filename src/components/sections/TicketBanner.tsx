"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import Button from "@/components/ui/Button";
import Eyebrow from "@/components/ui/Eyebrow";
import Placeholder from "@/components/ui/Placeholder";

export default function TicketBanner() {
  return (
    <section className="border-b border-line-soft">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto grid max-w-[1400px] grid-cols-1 lg:grid-cols-2"
      >
        <div className="flex flex-col justify-center gap-4 px-6 py-16 lg:px-10 lg:py-20">
          <Eyebrow>Get Your Tickets</Eyebrow>
          <h2 className="font-display text-3xl font-black uppercase leading-[0.95] tracking-tightest sm:text-4xl">
            Live Music.
            <br />
            Real Moments.
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            From intimate shows to massive events, be part of the movement wherever it lands next.
          </p>
          <div className="mt-2">
            <Button href="/events" variant="gold" icon="ticket">
              Browse Events
            </Button>
          </div>
        </div>
        <div className="relative min-h-[260px] border-t border-line-soft lg:border-l lg:border-t-0">
          <Placeholder tone="ink" icon={Users} aspect="aspect-auto h-full" pattern="grid" />
        </div>
      </motion.div>
    </section>
  );
}
