"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import Select from "@/components/ui/Select";
import Tabs from "@/components/ui/Tabs";
import ReleaseCard from "@/components/cards/ReleaseCard";
import LabelStrip from "@/components/sections/LabelStrip";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Placeholder from "@/components/ui/Placeholder";
import SectionHeading from "@/components/ui/SectionHeading";
import { RELEASES, LABELS } from "@/lib/data";
import { LABEL_CLASSES, LABEL_SHORT } from "@/lib/labelStyle";

const INCREMENT = 8;

const TYPE_TABS = [
  { key: "all", label: "All Releases" },
  { key: "Album", label: "Albums" },
  { key: "EP", label: "EPs" },
  { key: "Single", label: "Singles" },
];

export default function ReleasesClient() {
  const [type, setType] = useState("all");
  const [label, setLabel] = useState("all");
  const [sort, setSort] = useState("latest");
  const [visibleCount, setVisibleCount] = useState(INCREMENT);

  const filtered = useMemo(() => {
    let list = RELEASES.filter((r) => (type === "all" ? true : r.type === type));
    if (label !== "all") list = list.filter((r) => r.label === label);
    list = [...list].sort((a, b) => (sort === "latest" ? b.year - a.year : a.year - b.year));
    return list;
  }, [type, label, sort]);

  const featured = RELEASES[0];
  const featuredCls = LABEL_CLASSES[featured.label];

  return (
    <div className="bg-paper text-ink">
      <PageHero
        crumb="Releases"
        title="Releases"
        description="All the music. All the vibes. Explore our latest drops from across the BAE movement."
        primaryCta="Browse Releases"
        primaryHref="#catalog"
        tone="gold"
      />

      <section id="catalog" className="mx-auto max-w-[1400px] px-6 pb-16 pt-6 lg:px-10">
        <Tabs
          items={TYPE_TABS}
          active={type}
          onChange={(k) => {
            setType(k);
            setVisibleCount(INCREMENT);
          }}
        />

        <div className="mt-5 grid grid-cols-2 gap-3 sm:w-80 sm:grid-cols-2">
          <Select
            label="Label"
            value={label}
            onChange={(v) => {
              setLabel(v);
              setVisibleCount(INCREMENT);
            }}
            options={[{ label: "All Labels", value: "all" }, ...LABELS.map((l) => ({ label: l.name, value: l.slug }))]}
          />
          <Select
            label="Sort"
            value={sort}
            onChange={setSort}
            options={[
              { label: "Latest", value: "latest" },
              { label: "Oldest", value: "oldest" },
            ]}
          />
        </div>

        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-onlight">Latest Releases</p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {filtered.slice(0, visibleCount).map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.3, delay: (i % INCREMENT) * 0.04 }}
            >
              <ReleaseCard release={r} light />
            </motion.div>
          ))}
        </div>

        {visibleCount < filtered.length && (
          <div className="mt-8 flex justify-center">
            <Button variant="outline-light" icon="none" onClick={() => setVisibleCount((v) => v + INCREMENT)}>
              Load More
            </Button>
          </div>
        )}
      </section>

      {/* Featured release spotlight */}
      <section className="bg-ink py-6">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="grid grid-cols-1 gap-8 border border-line bg-ink-soft p-6 sm:p-8 lg:grid-cols-[280px_1fr]">
            <div className="relative aspect-square w-full overflow-hidden">
              <Placeholder tone={featured.label} aspect="aspect-auto h-full" pattern="grid" />
            </div>
            <div>
              <Eyebrow>Featured Release</Eyebrow>
              <h3 className="mt-2 font-display text-3xl font-black uppercase tracking-tight text-paper sm:text-4xl">
                {featured.title}
              </h3>
              <p className="mt-1 text-sm text-muted">{featured.artist}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-white ${featuredCls.bg}`}>
                  {LABEL_SHORT[featured.label]}
                </span>
                <span>{featured.trackCount} Tracks · {featured.year}</span>
              </div>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">{featured.blurb}</p>
              <Button variant="gold" icon="none" className="mt-5">
                <Play className="size-3.5 fill-current" /> Listen Now
              </Button>

              <div className="mt-8 divide-y divide-line-soft border-t border-line-soft">
                {featured.tracks.map((track, i) => (
                  <div key={track.title} className="flex items-center justify-between gap-4 py-2.5">
                    <div className="flex items-center gap-3 text-sm text-paper/90">
                      <span className="w-5 text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                      {track.title}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted">{track.duration}</span>
                      <Play className="size-3.5 text-muted" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest music videos */}
      <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10">
        <SectionHeading eyebrow="Latest Music Videos" title="Watch Now" light action="View All Videos" actionHref="/media" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {RELEASES.slice(0, 5).map((r) => (
            <div key={r.id} className="group cursor-pointer">
              <div className="relative overflow-hidden">
                <Placeholder tone={r.label} aspect="aspect-video" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex size-9 items-center justify-center rounded-full bg-white/90 text-ink transition-transform group-hover:scale-110">
                    <Play className="size-3.5 translate-x-[1px] fill-current" />
                  </span>
                </span>
              </div>
              <p className="mt-2 truncate text-xs font-semibold uppercase tracking-tight text-ink">{r.title}</p>
              <p className="truncate text-[11px] text-muted-onlight">{r.artist}</p>
            </div>
          ))}
        </div>
      </section>

      <LabelStrip />
    </div>
  );
}
