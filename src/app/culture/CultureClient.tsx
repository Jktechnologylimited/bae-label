"use client";

import { useState } from "react";
import { Play, LayoutGrid, MessageCircle, Shirt, PenTool, Crown, Users, ListMusic, CalendarHeart } from "lucide-react";
import SocialIcon from "@/components/brand/SocialIcon";
import PageHero from "@/components/sections/PageHero";
import Tabs from "@/components/ui/Tabs";
import SectionHeading from "@/components/ui/SectionHeading";
import Placeholder from "@/components/ui/Placeholder";
import NewsletterBand from "@/components/sections/NewsletterBand";
import BaeMark from "@/components/brand/BaeMark";
import { CULTURE_STORIES } from "@/lib/data";

const TABS = [
  { key: "all", label: "All Culture", icon: LayoutGrid },
  { key: "stories", label: "Stories", icon: MessageCircle },
  { key: "fashion", label: "Fashion", icon: Shirt },
  { key: "art", label: "Art & Design", icon: PenTool },
  { key: "lifestyle", label: "Lifestyle", icon: Crown },
  { key: "community", label: "Community", icon: Users },
  { key: "playlists", label: "Playlists", icon: ListMusic },
  { key: "experiences", label: "BAE Experiences", icon: CalendarHeart },
];

const HIGHLIGHTS = [
  { title: "Studio Diaries", tag: "Behind the Scenes", tone: "ink" as const },
  { title: "BAE Fit Check", tag: "Fashion", tone: "gold" as const },
  { title: "Creative Process", tag: "Art & Design", tone: "bigdripuniverse" as const },
  { title: "On The Road", tag: "Lifestyle", tone: "ag20" as const },
  { title: "BAE Family", tag: "Community", tone: "elmayanaconcept" as const },
  { title: "Live Moments", tag: "Experiences", tone: "ink" as const },
];

export default function CultureClient() {
  const [tab, setTab] = useState("all");

  return (
    <div className="bg-paper text-ink">
      <PageHero
        crumb="BAE Culture"
        title="BAE Culture"
        description="More than music. It's a lifestyle. The stories, the people, the art and everything that shapes the movement."
        primaryCta="Explore Culture"
        primaryHref="#stories"
        tone="bigdripuniverse"
      />

      <section id="stories" className="mx-auto max-w-[1400px] px-6 pt-8 lg:px-10">
        <Tabs items={TABS} active={tab} onChange={setTab} />
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10">
        <SectionHeading eyebrow="Featured Stories" title="From the Movement" light action="View All Stories" actionHref="#stories" />
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CULTURE_STORIES.map((story) => (
            <article key={story.id} id={story.id} className="group border border-black/10 bg-white transition-colors hover:border-black/30">
              <Placeholder tone="ink" aspect="aspect-[16/10]" />
              <div className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-onlight">{story.tag}</p>
                <h3 className="mt-2 font-display text-base font-bold uppercase leading-snug tracking-tight text-ink">
                  {story.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-onlight">{story.excerpt}</p>
                <p className="mt-4 text-[11px] text-muted-onlight">
                  {story.date} · {story.readTime}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-14 lg:px-10">
        <SectionHeading eyebrow="Culture Highlights" title="Watch & Discover" light action="View All Highlights" actionHref="#stories" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {HIGHLIGHTS.map((h) => (
            <div key={h.title} className="group cursor-pointer">
              <div className="relative overflow-hidden">
                <Placeholder tone={h.tone} aspect="aspect-square" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex size-9 items-center justify-center rounded-full bg-white/90 text-ink transition-transform group-hover:scale-110">
                    <Play className="size-3.5 translate-x-[1px] fill-current" />
                  </span>
                </span>
              </div>
              <p className="mt-2 truncate text-xs font-semibold text-ink">{h.title}</p>
              <p className="truncate text-[11px] text-muted-onlight">{h.tag}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink py-16">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-8 px-6 sm:flex-row lg:px-10">
          <blockquote className="max-w-xl font-display text-2xl font-black uppercase leading-tight tracking-tight text-paper sm:text-3xl">
            &ldquo;Culture isn&rsquo;t created. It&rsquo;s lived. We just capture it.&rdquo;
          </blockquote>
          <BaeMark size={110} className="shrink-0 text-paper" />
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
        <SectionHeading eyebrow="Follow BAE Culture" title="On Instagram" light action="View on Instagram" actionHref="https://instagram.com" />
        <div className="mt-8 grid grid-cols-4 gap-3 sm:grid-cols-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <a
              key={i}
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="group relative block overflow-hidden"
            >
              <Placeholder tone={i % 2 === 0 ? "ink" : "gold"} aspect="aspect-square" />
              <span className="absolute bottom-2 right-2 text-white/80 transition-transform group-hover:scale-110">
                <SocialIcon icon="instagram" className="size-4" />
              </span>
            </a>
          ))}
        </div>
      </section>

      <NewsletterBand title="Culture Culture. Be the Movement." description="Get exclusive stories, drops and experiences straight to your inbox." />
    </div>
  );
}
