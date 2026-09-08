import Link from "next/link";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import Placeholder from "@/components/ui/Placeholder";
import { Artist } from "@/lib/types";
import { LABEL_CLASSES, LABEL_SHORT } from "@/lib/labelStyle";
import { LABELS } from "@/lib/data";

export default function ArtistCard({ artist, light = false }: { artist: Artist; light?: boolean }) {
  const cls = LABEL_CLASSES[artist.label];
  const labelName = LABELS.find((l) => l.slug === artist.label)?.name ?? artist.label;

  return (
    <Link
      href={`/artists#${artist.id}`}
      className={clsx(
        "group block overflow-hidden border transition-colors",
        light ? "border-black/10 bg-white hover:border-black/30" : "border-line bg-ink-soft hover:border-line"
      )}
    >
      <div className="relative">
        <Placeholder tone={artist.label} aspect="aspect-[4/5]" imageUrl={artist.imageUrl} />
        <span
          className={clsx(
            "absolute left-3 top-3 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white",
            cls.bg
          )}
        >
          {LABEL_SHORT[artist.label]}
        </span>
        {artist.status === "new" && (
          <span className="absolute right-3 top-3 bg-gold px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-gold-ink">
            New
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className={clsx("font-display text-lg font-bold uppercase tracking-tight", light ? "text-ink" : "text-paper")}>
          {artist.name}
        </h3>
        <p className={clsx("mt-1 text-xs font-medium uppercase tracking-[0.06em]", cls.text)}>{artist.genre}</p>
        <p className={clsx("mt-3 line-clamp-2 text-sm", light ? "text-muted-onlight" : "text-muted")}>{artist.bio}</p>
        <p className={clsx(
          "mt-2 text-[10px] font-semibold uppercase tracking-[0.1em]",
          light ? "text-muted-onlight" : "text-muted"
        )}>
          {labelName}
        </p>
        <span
          className={clsx(
            "mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em]",
            light ? "text-ink" : "text-paper"
          )}
        >
          View Profile
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
