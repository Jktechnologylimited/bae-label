import type { Metadata } from "next";
import EventForm from "../EventForm";

export const metadata: Metadata = { title: "Admin — New Event" };

export default function NewEventPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-black uppercase tracking-tight">New Event</h1>
      <p className="mt-1 text-sm text-muted">This will appear immediately on /events and /tickets once saved.</p>
      <div className="mt-6">
        <EventForm />
      </div>
    </div>
  );
}
