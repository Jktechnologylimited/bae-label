import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { listEvents } from "@/lib/db/events";
import DeleteEventButton from "./DeleteEventButton";

export const metadata: Metadata = { title: "Admin — Events" };

export default async function AdminEventsPage() {
  const events = await listEvents();

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight">Events</h1>
          <p className="mt-1 text-sm text-muted">Ticket categories, prices and availability live here.</p>
        </div>
        <Link
          href="/admin/events/new"
          className="flex items-center gap-1.5 bg-gold px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-gold-ink hover:bg-white"
        >
          <Plus className="size-3.5" /> New Event
        </Link>
      </div>

      <div className="mt-6 divide-y divide-line border-y border-line">
        {events.map((e) => (
          <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="font-semibold">{e.name}</p>
              <p className="text-xs text-muted">
                {e.fullDate} · {e.venue}, {e.city} · {e.tiers.length} tier{e.tiers.length !== 1 ? "s" : ""} ·{" "}
                <span className="capitalize">{e.status}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/events/${e.id}`}
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted hover:text-paper"
              >
                <Pencil className="size-3.5" /> Edit
              </Link>
              <DeleteEventButton id={e.id} name={e.name} />
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="py-8 text-sm text-muted">No events yet — create your first one.</p>}
      </div>
    </div>
  );
}
