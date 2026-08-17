import { Play } from "lucide-react";
import clsx from "clsx";
import Placeholder from "@/components/ui/Placeholder";
import { Release } from "@/lib/types";
import { LABEL_CLASSES, LABEL_SHORT } from "@/lib/labelStyle";

export default function ReleaseCard({ release, light = false }: { release: Release; light?: boolean }) {
  const cls = LABEL_CLASSES[release.label];
  return (
    <button
      className={clsx(
        "group block w-full overflow-hidden border text-left transition-colors",
        light ? "border-black/10 bg-white hover:border-black/30" : "border-line bg-ink-soft hover:border-line"
      )}
    >
      <div className="relative">
        <Placeholder tone={release.label} aspect="aspect-square" pattern="grid" />
        <span className="absolute left-3 top-3 bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
          {release.type}
        </span>
        <span className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-gold text-gold-ink opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100">
          <Play className="size-4 translate-x-[1px] fill-current" />
        </span>
      </div>
      <div className="p-4">
        <h3 className={clsx("truncate font-display text-base font-bold uppercase tracking-tight", light ? "text-ink" : "text-paper")}>
          {release.title}
        </h3>
        <p className={clsx("mt-0.5 truncate text-sm", light ? "text-muted-onlight" : "text-muted")}>{release.artist}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className={clsx("px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-white", cls.bg)}>
            {LABEL_SHORT[release.label]}
          </span>
          <span className={clsx("text-[11px]", light ? "text-muted-onlight" : "text-muted")}>
            {release.trackCount} {release.trackCount === 1 ? "Track" : "Tracks"} · {release.year}
          </span>
        </div>
      </div>
    </button>
  );
}
