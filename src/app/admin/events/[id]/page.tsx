import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEvent } from "@/lib/db/events";
import EventForm from "../EventForm";

export const metadata: Metadata = { title: "Admin — Edit Event" };

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight">Edit Event</h1>
      <p className="mt-1 text-sm text-muted">{event.name}</p>
      <div className="mt-6">
        <EventForm event={event} />
      </div>
    </div>
  );
}
