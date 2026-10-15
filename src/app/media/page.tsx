import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import MediaClient from "./MediaClient";

export const metadata: Metadata = pageMetadata({
  title: "Media",
  description: "Videos, photos, playlists and podcasts from across the BAE movement.",
  path: "/media",
});

export default function MediaPage() {
  return <MediaClient />;
}
