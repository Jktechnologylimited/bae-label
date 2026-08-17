import type { Metadata } from "next";
import Link from "next/link";
import { Globe2, Users, Music4, CalendarDays, Radio, ShieldCheck, Sparkles, Heart, TrendingUp } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import SectionHeading from "@/components/ui/SectionHeading";
import Placeholder from "@/components/ui/Placeholder";
import Button from "@/components/ui/Button";
import { LABELS } from "@/lib/data";
import { LABEL_CLASSES } from "@/lib/labelStyle";
import clsx from "clsx";

export const metadata: Metadata = {
  title: "About",
  description: "BAE is a movement built on culture, creativity and community — three labels, one vision.",
};

const IMPACT = [
  { icon: Globe2, value: "3", label: "Labels", sub: "United under one vision" },
  { icon: Users, value: "150+", label: "Artists", sub: "Empowered & supported" },
  { icon: Music4, value: "500+", label: "Releases", sub: "Across all platforms" },
  { icon: CalendarDays, value: "100+", label: "Events", sub: "Worldwide" },
  { icon: Radio, value: "1M+", label: "Fans", sub: "And growing daily" },
];

const VALUES = [
  { icon: ShieldCheck, title: "Authenticity", desc: "We stay true to our culture and our artists." },
  { icon: Sparkles, title: "Creativity", desc: "Pushing boundaries through sound and art." },
  { icon: Users, title: "Community", desc: "Building a global family of creatives and fans." },
  { icon: TrendingUp, title: "Growth", desc: "Evolving together and creating impact." },
  { icon: Heart, title: "Respect", desc: "Respect the culture, the process and the people." },
];

export default function AboutPage() {
  return (
    <div className="bg-paper text-ink">
      <PageHero
        crumb="About"
        title="About BAE"
        description="BAE is more than a label collective. We are a movement built on culture, creativity and community. Three labels. One vision."
        primaryCta="Our Story"
        primaryHref="#story"
        secondaryCta="Join the Movement"
        secondaryHref="/contact"
        tone="ink"
      />

      <section id="story" className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-onlight">Who We Are</p>
            <h2 className="mt-3 font-display text-3xl font-black uppercase leading-[0.95] tracking-tightest text-ink sm:text-4xl">
              The Movement Behind the Music
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-onlight">
              BAE brings together three unique labels — BigDripUniverse, AG20 and ElmayanaConcept — each with their own
              sound, identity and purpose. United under one vision to shape the future of music and culture.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-onlight">
              We champion independent artists, push creative boundaries, and build a global community that lives the
              culture, on stage and off it.
            </p>
            <Button href="/culture" variant="dark" className="mt-6">
              Our Story
            </Button>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Placeholder tone="gold" aspect="aspect-auto h-full" />
          </div>
        </div>
      </section>

      <section className="bg-ink py-12 text-paper">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-8 px-6 sm:grid-cols-5 lg:px-10">
          {IMPACT.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <stat.icon className="size-5 text-gold" />
              <p className="mt-3 font-display text-3xl font-black">{stat.value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-paper/90">{stat.label}</p>
              <p className="mt-0.5 text-[11px] text-muted">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
        <SectionHeading eyebrow="Our Labels" title="Three Labels. One Vision." light action="Explore Our Labels" actionHref="/artists" />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {LABELS.map((label) => {
            const cls = LABEL_CLASSES[label.slug];
            return (
              <div key={label.slug} className="border border-black/10 bg-white p-6">
                <p className={clsx("font-display text-2xl font-black uppercase tracking-tight", cls.text)}>{label.wordmark}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-onlight">{label.description}</p>
                <Link
                  href={`/artists?label=${label.slug}`}
                  className="mt-4 inline-block text-[11px] font-semibold uppercase tracking-[0.1em] text-ink hover:text-gold"
                >
                  Learn More →
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-black/10 bg-paper-soft py-16">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <SectionHeading eyebrow="Our Values" title="What We Stand For" light align="center" />
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {VALUES.map((v) => (
              <div key={v.title} className="flex flex-col items-center text-center">
                <span className="flex size-12 items-center justify-center border border-black/15 bg-white">
                  <v.icon className="size-5 text-ink" />
                </span>
                <p className="mt-3 text-sm font-bold uppercase tracking-tight text-ink">{v.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-onlight">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
