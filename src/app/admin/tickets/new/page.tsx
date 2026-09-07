import type { Metadata } from "next";
import { listEvents } from "@/lib/db/events";
import { IssueTicketForm } from "../TicketForm";

export const metadata: Metadata = { title: "Admin — Issue Ticket" };

export default async function NewTicketPage() {
  const events = await listEvents();

  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight">Issue Ticket</h1>
      <p className="mt-1 text-sm text-muted">Manually issue a comp or offline-sale ticket.</p>
      <div className="mt-6">
        {events.length === 0 ? (
          <p className="text-sm text-muted">Create an event first before issuing tickets.</p>
        ) : (
          <IssueTicketForm events={events} />
        )}
      </div>
    </div>
  );
}
