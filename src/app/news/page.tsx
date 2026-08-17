import type { Metadata } from "next";
import NewsClient from "./NewsClient";

export const metadata: Metadata = {
  title: "News",
  description: "Announcements, releases, culture and press from across BAE.",
};

export default function NewsPage() {
  return <NewsClient />;
}
