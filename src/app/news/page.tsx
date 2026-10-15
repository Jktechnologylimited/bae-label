import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import NewsClient from "./NewsClient";
import { listNews } from "@/lib/db/news";

export const metadata: Metadata = pageMetadata({
  title: "News",
  description: "Announcements, releases, culture and press from across BAE.",
  path: "/news",
});

export default async function NewsPage() {
  const news = await listNews();
  return <NewsClient news={news} />;
}
