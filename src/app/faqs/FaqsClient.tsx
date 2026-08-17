"use client";

import { useMemo, useState } from "react";
import { Headphones, Info, Disc3, Users2, CalendarDays, Music, Handshake, UserCircle, LifeBuoy, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import BaeMark from "@/components/brand/BaeMark";

interface Faq {
  q: string;
  a: string;
  category: string;
}

const FAQS: Faq[] = [
  { category: "About BAE", q: "What is BAE?", a: "BAE is a music label collective uniting three labels — BigDripUniverse, AG20 and ElmayanaConcept — under one shared vision for music and culture." },
  { category: "About BAE", q: "Which labels are under BAE?", a: "BigDripUniverse, AG20 and ElmayanaConcept, each with its own sound, artists and identity." },
  { category: "Music & Releases", q: "How can I listen to music from BAE artists?", a: "All releases are available on major streaming platforms including Spotify, Apple Music and YouTube — find links on each release or artist page." },
  { category: "Artists", q: "How can I become an artist on one of your labels?", a: "Submit your music through our Contact page and our A&R team will review it. We accept submissions on a rolling basis." },
  { category: "Music & Releases", q: "How do I submit my music?", a: "Send a streaming link and a short bio via the contact form and select \"Submission\" as your subject." },
  { category: "Events & Tickets", q: "Where can I buy tickets for events?", a: "Tickets are available on our Get Tickets page for all upcoming shows across our three labels." },
  { category: "Events & Tickets", q: "Can I get a refund for my ticket?", a: "Refunds are available up to 48 hours before an event. See our Terms & Conditions for full details." },
  { category: "Events & Tickets", q: "Do you offer VIP or table reservations?", a: "Yes, most events include VIP and VVIP tiers with perks like priority entry and meet & greets — select these on the ticket page." },
  { category: "Collaborations", q: "How can I collaborate with BAE?", a: "We welcome collaborations with brands, artists and creatives. Reach out through our Contact page with your proposal." },
  { category: "Collaborations", q: "Can I license music from BAE?", a: "Yes — for sync and licensing requests, contact press@bae.band with details on the intended use." },
  { category: "Support", q: "How do I contact BAE for press or media inquiries?", a: "Email press@bae.band for interviews, press kits and media requests." },
  { category: "Support", q: "How can I stay updated on BAE news and releases?", a: "Subscribe to our newsletter at the bottom of any page, or follow us on Instagram, X, YouTube, TikTok and Spotify." },
];

const CATEGORY_ICONS: Record<string, typeof Info> = {
  "About BAE": Info,
  "Our Labels": Disc3,
  Artists: Users2,
  "Events & Tickets": CalendarDays,
  "Music & Releases": Music,
  Collaborations: Handshake,
  "Account & Orders": UserCircle,
  Support: LifeBuoy,
};

export default function FaqsClient() {
  const [category, setCategory] = useState("All");
  const [open, setOpen] = useState<number | null>(null);

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of FAQS) counts[f.category] = (counts[f.category] ?? 0) + 1;
    return counts;
  }, []);

  const visible = category === "All" ? FAQS : FAQS.filter((f) => f.category === category);

  return (
    <div className="bg-paper text-ink">
      <section className="border-b border-black/10">
        <div className="mx-auto max-w-[1400px] px-6 pb-10 pt-8 lg:px-10 lg:pt-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "FAQs" }]} />
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
            <div>
              <h1 className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tightest text-ink sm:text-5xl">
                FAQs
              </h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-onlight">
                Find answers to the most frequently asked questions about BAE, our labels, events and more.
              </p>
            </div>
            <div className="relative flex aspect-[16/9] w-full flex-col items-center justify-center gap-3 overflow-hidden bg-ink lg:aspect-[4/3]">
              <div className="bg-grain absolute inset-0 opacity-40" />
              <BaeMark size={64} className="relative text-paper" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-14 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-6 lg:sticky lg:top-28 lg:h-fit">
            <div className="flex items-center gap-4 border border-black/10 bg-ink p-5 text-paper">
              <Headphones className="size-6 shrink-0" />
              <div>
                <p className="text-sm font-bold">Still Need Help?</p>
                <p className="mt-0.5 text-xs text-muted">Our team is here for you.</p>
                <a href="/contact" className="mt-2 inline-block text-[11px] font-semibold uppercase tracking-[0.08em] text-gold">
                  Contact Us →
                </a>
              </div>
            </div>

            <div className="border border-black/10 bg-white p-2">
              <button
                onClick={() => setCategory("All")}
                className={clsx(
                  "flex w-full items-center justify-between px-3 py-2.5 text-sm font-semibold",
                  category === "All" ? "bg-ink text-paper" : "text-ink hover:bg-paper-soft"
                )}
              >
                All Questions
                <span className="text-xs opacity-70">{FAQS.length}</span>
              </button>
              {Object.entries(categories).map(([cat, count]) => {
                const Icon = CATEGORY_ICONS[cat] ?? Info;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={clsx(
                      "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium",
                      category === cat ? "bg-ink text-paper" : "text-ink hover:bg-paper-soft"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="size-3.5" />
                      {cat}
                    </span>
                    <span className="text-xs opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div>
            <div className="divide-y divide-black/10 border-y border-black/10">
              {visible.map((faq, i) => {
                const isOpen = open === i;
                return (
                  <div key={faq.q}>
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center gap-4 py-4 text-left"
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-paper">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm font-semibold text-ink">{faq.q}</span>
                      <Plus className={clsx("size-4 shrink-0 text-muted-onlight transition-transform", isOpen && "rotate-45")} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="pb-4 pl-10 text-sm leading-relaxed text-muted-onlight">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink py-10">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-6 px-6 text-center sm:flex-row sm:text-left lg:px-10">
          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-tight text-paper">Still Have Questions?</h3>
            <p className="mt-1 text-sm text-muted">Be the first to know about new music, events and exclusive drops.</p>
          </div>
          <Button href="/contact" variant="gold">
            Contact Us
          </Button>
        </div>
      </section>
    </div>
  );
}
