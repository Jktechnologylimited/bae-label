"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import Button from "@/components/ui/Button";
import BaeMark from "@/components/brand/BaeMark";
import SocialIcon from "@/components/brand/SocialIcon";
import Placeholder from "@/components/ui/Placeholder";
import { SOCIAL_LINKS } from "@/lib/nav";
import clsx from "clsx";

const SLIDES = 5;

export default function Hero() {
  const [slide, setSlide] = useState(0);

  return (
    <section className="relative overflow-hidden border-b border-line-soft">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-10 px-6 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-10 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">Welcome to BAE</p>
          <h1 className="mt-4 font-display text-[13vw] font-black uppercase leading-[0.92] tracking-tightest sm:text-6xl lg:text-[4.5rem]">
            Three Labels.
            <br />
            One Movement.
          </h1>
          <div className="mt-6 flex h-[3px] w-56 overflow-hidden">
            <span className="w-1/4 bg-bigdrip" />
            <span className="w-1/4 bg-ag20" />
            <span className="w-1/4 bg-gold" />
            <span className="w-1/4 bg-elmayana" />
          </div>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
            BigDripUniverse. AG20. ElmayanaConcept. Different sounds. One vision.
            <br />
            Building the future of music and culture.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/about" variant="gold">
              Explore the Movement
            </Button>
            <Button href="/tickets" variant="outline-dark" icon="ticket">
              Get Tickets
            </Button>
          </div>
          <div className="mt-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Follow BAE</p>
            <div className="mt-3 flex items-center gap-4">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.icon}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="flex size-9 items-center justify-center border border-line text-paper transition-colors hover:border-gold hover:text-gold"
                >
                  <SocialIcon icon={s.icon} />
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="relative"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden border border-line lg:aspect-[5/6]">
            <Placeholder tone="ink" icon={Users} aspect="aspect-auto h-full" pattern="diagonal" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BaeMark size={200} animated className="text-paper drop-shadow-[0_0_40px_rgba(0,0,0,0.6)]" />
            </div>
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
              {Array.from({ length: SLIDES }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={clsx(
                    "h-1.5 rounded-full transition-all",
                    i === slide ? "w-6 bg-gold" : "w-1.5 bg-white/40 hover:bg-white/70"
                  )}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
