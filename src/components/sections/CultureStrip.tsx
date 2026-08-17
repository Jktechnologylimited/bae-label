"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import Placeholder from "@/components/ui/Placeholder";
import SectionHeading from "@/components/ui/SectionHeading";
import { Tone } from "@/components/ui/Placeholder";

const items: { label: string; tone: Tone }[] = [
  { label: "Behind the Scenes", tone: "ink" },
  { label: "BAE Experiences", tone: "bigdripuniverse" },
  { label: "Style & Fashion", tone: "gold" },
  { label: "In the Studio", tone: "ag20" },
  { label: "BAE Moments", tone: "elmayanaconcept" },
];

export default function CultureStrip() {
  return (
    <section className="border-b border-line-soft py-16 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading eyebrow="BAE Culture" title="Music. Style. Life." action="Explore Culture" actionHref="/culture" />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group relative block overflow-hidden text-left"
            >
              <Placeholder tone={item.tone} aspect="aspect-[3/4]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-11 items-center justify-center rounded-full border border-white/50 text-white transition-all group-hover:scale-110 group-hover:bg-gold group-hover:border-gold group-hover:text-gold-ink">
                  <Play className="size-4 translate-x-[1px] fill-current" />
                </span>
              </div>
              <p className="absolute bottom-3 left-3 right-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-white">
                {item.label}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
