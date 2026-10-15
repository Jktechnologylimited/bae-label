import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import EventsClient from "./EventsClient";
import { listEvents } from "@/lib/db/events";

export const metadata: Metadata = pageMetadata({
  title: "Events",
  description: "Upcoming and past BAE live shows, tours and showcases.",
  path: "/events",
});

export default async function EventsPage() {
  const events = await listEvents();
  return <EventsClient events={events} />;
}
