import type { Metadata } from "next";
import EventsClient from "./EventsClient";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past BAE live shows, tours and showcases.",
};

export default function EventsPage() {
  return <EventsClient />;
}
