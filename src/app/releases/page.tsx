import type { Metadata } from "next";
import ReleasesClient from "./ReleasesClient";

export const metadata: Metadata = {
  title: "Releases",
  description: "Explore albums, EPs and singles from BigDripUniverse, AG20 and ElmayanaConcept.",
};

export default function ReleasesPage() {
  return <ReleasesClient />;
}
