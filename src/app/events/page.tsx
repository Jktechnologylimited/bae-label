import type { Metadata } from "next";
import EventsClient from "./EventsClient";
import { listEvents } from "@/lib/db/events";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past BAE live shows, tours and showcases.",
};

export default async function EventsPage() {
  const events = await listEvents();
  return <EventsClient events={events} />;
}
