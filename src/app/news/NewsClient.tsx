"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, LayoutGrid, Megaphone, Music, CalendarDays, Crown, TrendingUp, Newspaper } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import Tabs from "@/components/ui/Tabs";
import Select from "@/components/ui/Select";
import Placeholder from "@/components/ui/Placeholder";
import NewsletterForm from "@/components/layout/NewsletterForm";
import { NewsPost } from "@/lib/types";

const TABS = [
  { key: "all", label: "All News", icon: LayoutGrid },
  { key: "Announcement", label: "Announcements", icon: Megaphone },
  { key: "Music", label: "Music", icon: Music },
  { key: "Events", label: "Events", icon: CalendarDays },
  { key: "Culture", label: "Culture", icon: Crown },
  { key: "Industry", label: "Industry", icon: TrendingUp },
  { key: "Press", label: "Press", icon: Newspaper },
];

const PRESS = [
  { title: "BAE: The Independent Force Redefining African Music", source: "Rolling Stone Africa", date: "May 18, 2025" },
  { title: "Inside BAE's Vision To Build A Global Movement", source: "NotJustOk", date: "May 16, 2025" },
  { title: "BigDripUniverse, AG20 & ElmayanaConcept Unite", source: "TNL Mag", date: "May 14, 2025" },
];

export default function NewsClient({ news: NEWS }: { news: NewsPost[] }) {
  const [tab, setTab] = useState("all");
  const [sort, setSort] = useState("latest");

  const filtered = useMemo(() => {
    const base = tab === "all" ? NEWS : NEWS.filter((n) => n.category === tab);
    return sort === "oldest" ? [...base].reverse() : base;
  }, [NEWS, tab, sort]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: NEWS.length };
    for (const n of NEWS) counts[n.category] = (counts[n.category] ?? 0) + 1;
    return counts;
  }, [NEWS]);

  const featured = NEWS[0] as NewsPost | undefined;
  const rest = filtered.filter((n) => n.id !== featured?.id);

  return (
    <div className="bg-paper text-ink">
      <PageHero
        crumb="News"
        title="News"
        description="The latest updates, announcements and stories from BAE and the culture we're building."
        primaryCta="Browse News"
        primaryHref="#latest"
        tone="gold"
      />

      <section id="latest" className="mx-auto max-w-[1400px] px-6 pt-8 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs items={TABS} active={tab} onChange={setTab} />
          <div className="w-full sm:w-48">
            <Select
              label="Sort by"
              value={sort}
              onChange={setSort}
              options={[
                { label: "Latest First", value: "latest" },
                { label: "Oldest First", value: "oldest" },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-12 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
          <div>
            {featured && (
            <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-onlight">Featured News</p>
            <Link href={`#${featured.id}`} className="group mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:items-center">
              <Placeholder tone="gold" aspect="aspect-[16/10]" />
              <div>
                <span className="inline-block bg-ink px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-paper">
                  {featured.category}
                </span>
                <h2 className="mt-3 font-display text-2xl font-black uppercase leading-tight tracking-tight text-ink sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-onlight">{featured.excerpt}</p>
                <p className="mt-3 text-xs text-muted-onlight">
                  {featured.date} · {featured.readTime}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink">
                  Read More <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
            </>
            )}

            <p className="mt-12 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-onlight">Latest News</p>
            <div className="mt-4 divide-y divide-black/10 border-t border-black/10">
              {rest.map((post) => (
                <NewsRow key={post.id} post={post} />
              ))}
              {rest.length === 0 && <p className="py-10 text-sm text-muted-onlight">No stories in this category yet.</p>}
            </div>
          </div>

          <aside className="space-y-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-onlight">Categories</p>
              <ul className="mt-4 divide-y divide-black/10 border-y border-black/10">
                {Object.entries(categoryCounts).map(([cat, count]) => (
                  <li key={cat} className="flex items-center justify-between py-2.5 text-sm text-ink">
                    <span>{cat === "All" ? "All News" : cat}</span>
                    <span className="text-muted-onlight">{count}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-ink p-6 text-paper">
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em]">Stay In The Loop</h3>
              <p className="mt-2 text-sm text-muted">
                Get the latest news, drops, events and updates from BAE straight to your inbox.
              </p>
              <div className="mt-4">
                <NewsletterForm variant="dark" placeholder="Enter your email" ctaLabel="Subscribe" />
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-onlight">Latest Press</p>
              <ul className="mt-4 space-y-4">
                {PRESS.map((p) => (
                  <li key={p.title} className="flex items-start gap-3">
                    <div className="size-12 shrink-0">
                      <Placeholder tone="ink" aspect="aspect-square" />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-xs font-semibold text-ink">{p.title}</p>
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-onlight">
                        {p.source} · {p.date}
                        <ExternalLink className="size-3 shrink-0" />
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function NewsRow({ post }: { post: NewsPost }) {
  return (
    <Link href={`#${post.id}`} id={post.id} className="group flex gap-4 py-5">
      <div className="w-28 shrink-0 sm:w-40">
        <Placeholder tone="ink" aspect="aspect-[4/3]" />
      </div>
      <div className="min-w-0">
        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.1em] text-muted-onlight">{post.category}</span>
        <h3 className="mt-1 truncate font-display text-base font-bold uppercase tracking-tight text-ink sm:text-lg">
          {post.title}
        </h3>
        <p className="mt-1 line-clamp-2 max-w-lg text-sm text-muted-onlight">{post.excerpt}</p>
        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-onlight">
          <span>{post.date}</span>
          <span>{post.readTime}</span>
          <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-[0.08em] text-ink">
            Read More <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
