import type { Metadata } from "next";
import ReleasesClient from "./ReleasesClient";
import { listReleases } from "@/lib/db/releases";

export const metadata: Metadata = {
  title: "Releases",
  description: "Explore albums, EPs and singles from BigDripUniverse, AG20 and ElmayanaConcept.",
};

export default async function ReleasesPage() {
  const releases = await listReleases();
  return <ReleasesClient releases={releases} />;
}
