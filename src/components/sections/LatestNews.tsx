"use client";

import { motion } from "framer-motion";
import NewsCard from "@/components/cards/NewsCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { NewsPost } from "@/lib/types";

export default function LatestNews({ news }: { news: NewsPost[] }) {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeading eyebrow="Latest News" title="Stay Updated" action="View All News" actionHref="/news" />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {news.slice(0, 3).map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <NewsCard post={post} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
