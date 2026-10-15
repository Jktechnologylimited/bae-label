import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import ReleasesClient from "./ReleasesClient";
import { listReleases } from "@/lib/db/releases";

export const metadata: Metadata = pageMetadata({
  title: "Releases",
  description: "Explore albums, EPs and singles from BigDripUniverse, AG20 and ElmayanaConcept.",
  path: "/releases",
});

export default async function ReleasesPage() {
  const releases = await listReleases();
  return <ReleasesClient releases={releases} />;
}
