"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import Placeholder from "@/components/ui/Placeholder";
import SectionHeading from "@/components/ui/SectionHeading";
import { LABELS } from "@/lib/data";
import { LABEL_CLASSES } from "@/lib/labelStyle";

export default function LabelsGrid() {
  return (
    <section className="border-b border-line-soft py-16 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading eyebrow="The Three Labels" title="Three Identities. One Family." action="View All Labels" actionHref="/artists" />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {LABELS.map((label, i) => {
            const cls = LABEL_CLASSES[label.slug];
            return (
              <motion.div
                key={label.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link
                  href={`/artists?label=${label.slug}`}
                  className={clsx(
                    "group relative block aspect-[3/4] overflow-hidden border transition-colors",
                    cls.border + "/30 hover:" + cls.border
                  )}
                >
                  <Placeholder tone={label.slug} aspect="aspect-auto h-full" pattern="diagonal" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
                  <div className="absolute inset-x-0 top-8 flex justify-center px-6">
                    <span className={clsx("font-display text-2xl font-black uppercase tracking-tight sm:text-3xl", cls.text)}>
                      {label.wordmark}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="font-display text-xl font-bold uppercase tracking-tight text-paper">{label.name}</h3>
                    <p className="mt-2 text-sm text-white/70">{label.tagline}</p>
                    <span className={clsx("mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em]", cls.text)}>
                      Explore Label
                      <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
