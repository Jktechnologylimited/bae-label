import type { Metadata } from "next";
import MediaClient from "./MediaClient";

export const metadata: Metadata = {
  title: "Media",
  description: "Videos, photos, playlists and podcasts from across the BAE movement.",
};

export default function MediaPage() {
  return <MediaClient />;
}
