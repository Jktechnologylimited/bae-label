import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { listTickets } from "@/lib/ticketing/store";
import { listEvents } from "@/lib/db/events";
import VoidTicketButton from "./VoidTicketButton";
import DeleteTicketButton from "./DeleteTicketButton";

export const metadata: Metadata = { title: "Admin — Tickets" };

export default async function AdminTicketsPage() {
  const [tickets, events] = await Promise.all([listTickets(), listEvents()]);
  const sorted = [...tickets].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  const eventName = (id: string) => events.find((e) => e.id === id)?.name ?? id;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight">Tickets</h1>
          <p className="mt-1 text-sm text-muted">
            {tickets.length} issued · {tickets.filter((t) => t.status === "used").length} scanned
          </p>
        </div>
        <Link
          href="/admin/tickets/new"
          className="flex items-center gap-1.5 bg-gold px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-gold-ink hover:bg-white"
        >
          <Plus className="size-3.5" /> Issue Ticket
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
              <th className="py-2 pr-4">Code</th>
              <th className="py-2 pr-4">Event</th>
              <th className="py-2 pr-4">Tier</th>
              <th className="py-2 pr-4">Holder</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t) => (
              <tr key={t.code} className="border-b border-line-soft">
                <td className="py-3 pr-4 font-mono text-xs">{t.code}</td>
                <td className="py-3 pr-4">{eventName(t.eventId)}</td>
                <td className="py-3 pr-4">{t.tierName}</td>
                <td className="py-3 pr-4">{t.holderName}</td>
                <td className="py-3 pr-4">
                  <span
                    className={
                      t.status === "valid" ? "text-elmayana" : t.status === "used" ? "text-muted" : "text-bigdrip"
                    }
                  >
                    {t.status}
                    {t.status === "used" && t.usedAt && (
                      <span className="ml-1 text-[10px] text-muted">{new Date(t.usedAt).toLocaleString()}</span>
                    )}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/tickets/${t.code}`}
                      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted hover:text-paper"
                    >
                      <Pencil className="size-3.5" /> Edit
                    </Link>
                    {t.status === "valid" && <VoidTicketButton code={t.code} />}
                    <DeleteTicketButton code={t.code} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tickets.length === 0 && <p className="py-8 text-sm text-muted">No tickets issued yet.</p>}
      </div>
    </div>
  );
}
