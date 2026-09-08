import Link from "next/link";
import { MapPin } from "lucide-react";
import clsx from "clsx";
import Placeholder from "@/components/ui/Placeholder";
import { BaeEvent } from "@/lib/types";
import { LABEL_CLASSES, LABEL_SHORT } from "@/lib/labelStyle";

export default function EventCard({ event, light = false }: { event: BaeEvent; light?: boolean }) {
  const primary = event.labels[0];
  const cls = LABEL_CLASSES[primary];

  return (
    <div
      className={clsx(
        "group flex flex-col overflow-hidden border transition-colors",
        light ? "border-black/10 bg-white hover:border-black/30" : "border-line bg-ink-soft hover:border-line"
      )}
    >
      <div className="relative">
        <Placeholder tone={primary} aspect="aspect-[16/10]" pattern="diagonal" imageUrl={event.imageUrl} />
        <div className="absolute left-3 top-3 flex w-12 flex-col items-center bg-black/80 py-1.5 text-white">
          <span className="font-display text-lg font-black leading-none">{event.day}</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.08em]">{event.month}</span>
        </div>
        {event.status === "past" && (
          <span className="absolute right-3 top-3 bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
            Event Ended
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className={clsx("font-display text-lg font-bold uppercase leading-tight tracking-tight", light ? "text-ink" : "text-paper")}>
          {event.name}
        </h3>
        <p className={clsx("mt-2 flex items-center gap-1.5 text-sm", light ? "text-muted-onlight" : "text-muted")}>
          <MapPin className="size-3.5 shrink-0" />
          {event.city} · {event.venue}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {event.labels.map((l) => (
            <span key={l} className={clsx("px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-white", LABEL_CLASSES[l].bg)}>
              {LABEL_SHORT[l]}
            </span>
          ))}
        </div>
        <div className="mt-5 pt-0">
          {event.status === "upcoming" ? (
            <Link
              href={`/tickets?event=${event.id}`}
              className={clsx(
                "flex w-full items-center justify-center border py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors",
                cls.border,
                cls.text,
                "hover:bg-white/5"
              )}
            >
              Get Tickets
            </Link>
          ) : (
            <span
              className={clsx(
                "flex w-full items-center justify-center border py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em]",
                light ? "border-black/10 text-muted-onlight" : "border-line text-muted"
              )}
            >
              Event Ended
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
