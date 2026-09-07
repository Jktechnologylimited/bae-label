import type { Metadata } from "next";
import NewsClient from "./NewsClient";
import { listNews } from "@/lib/db/news";

export const metadata: Metadata = {
  title: "News",
  description: "Announcements, releases, culture and press from across BAE.",
};

export default async function NewsPage() {
  const news = await listNews();
  return <NewsClient news={news} />;
}
