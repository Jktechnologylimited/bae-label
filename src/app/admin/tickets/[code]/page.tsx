import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTicket } from "@/lib/ticketing/store";
import { getEvent } from "@/lib/db/events";
import { EditTicketForm } from "../TicketForm";

export const metadata: Metadata = { title: "Admin — Edit Ticket" };

export default async function EditTicketPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const ticket = await getTicket(code);
  if (!ticket) notFound();
  const event = await getEvent(ticket.eventId);

  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight">Edit Ticket</h1>
      <p className="mt-1 font-mono text-sm text-muted">{ticket.code}</p>
      <div className="mt-6">
        <EditTicketForm ticket={ticket} event={event} />
      </div>
    </div>
  );
}
