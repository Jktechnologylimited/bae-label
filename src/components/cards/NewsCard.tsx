import Link from "next/link";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import Placeholder from "@/components/ui/Placeholder";
import { NewsPost } from "@/lib/types";

const CATEGORY_TONE: Record<NewsPost["category"], "gold" | "bigdripuniverse" | "ag20" | "elmayanaconcept" | "ink"> = {
  Announcement: "gold",
  Music: "bigdripuniverse",
  Events: "ag20",
  Culture: "elmayanaconcept",
  Industry: "ink",
  Press: "ink",
};

export default function NewsCard({ post, light = false }: { post: NewsPost; light?: boolean }) {
  return (
    <Link
      href={`/news#${post.id}`}
      className={clsx(
        "group block overflow-hidden border transition-colors",
        light ? "border-black/10 bg-white hover:border-black/30" : "border-line bg-ink-soft hover:border-line"
      )}
    >
      <Placeholder tone={CATEGORY_TONE[post.category]} aspect="aspect-[16/10]" />
      <div className="p-5">
        <p className={clsx("text-[10px] font-bold uppercase tracking-[0.14em]", light ? "text-muted-onlight" : "text-muted")}>
          {post.category}
        </p>
        <h3 className={clsx("mt-2 font-display text-base font-bold uppercase leading-snug tracking-tight", light ? "text-ink" : "text-paper")}>
          {post.title}
        </h3>
        <p className={clsx("mt-2 line-clamp-2 text-sm", light ? "text-muted-onlight" : "text-muted")}>{post.excerpt}</p>
        <div className={clsx("mt-4 flex items-center justify-between text-[11px]", light ? "text-muted-onlight" : "text-muted")}>
          <span>{post.date}</span>
          <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-[0.08em] text-gold">
            Read more
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
