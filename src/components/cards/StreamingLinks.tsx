import StreamingIcon, { STREAMING_META } from "@/components/brand/StreamingIcon";
import { StreamingLink } from "@/lib/types";
import clsx from "clsx";

/** Small row of platform icon links — for use on cards and compact spaces. */
export function StreamingIconRow({ links, className }: { links?: StreamingLink[]; className?: string }) {
  if (!links || links.length === 0) return null;
  return (
    <div className={clsx("flex items-center gap-1.5", className)} onClick={(e) => e.stopPropagation()}>
      {links.map((link) => (
        <a
          key={link.platform}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Listen on ${STREAMING_META[link.platform].label}`}
          className="flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition-transform hover:scale-110"
          style={{ color: STREAMING_META[link.platform].color }}
        >
          <StreamingIcon platform={link.platform} className="size-3.5" />
        </a>
      ))}
    </div>
  );
}

/** Full-width platform buttons with labels — for the featured release spotlight. */
export function StreamingButtonList({ links, className }: { links?: StreamingLink[]; className?: string }) {
  if (!links || links.length === 0) return null;
  return (
    <div className={clsx("flex flex-wrap gap-2", className)}>
      {links.map((link) => {
        const meta = STREAMING_META[link.platform];
        return (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 border border-line px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-paper transition-colors hover:border-current"
            style={{ color: meta.color }}
          >
            <StreamingIcon platform={link.platform} />
            {meta.label}
          </a>
        );
      })}
    </div>
  );
}
