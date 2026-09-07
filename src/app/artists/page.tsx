import { Suspense } from "react";
import type { Metadata } from "next";
import ArtistsClient from "./ArtistsClient";
import { CardGridSkeleton } from "@/components/ui/Skeleton";
import PageHero from "@/components/sections/PageHero";
import LabelStrip from "@/components/sections/LabelStrip";
import { listArtists } from "@/lib/db/artists";

export const metadata: Metadata = {
  title: "Artists",
  description: "Meet the artists of BigDripUniverse, AG20 and ElmayanaConcept.",
};

export default async function ArtistsPage() {
  const artists = await listArtists();
  return (
    <div className="bg-paper text-ink">
      <PageHero
        crumb="Artists"
        title="Artists"
        description="Meet the voices. Discover the talent. Different styles. One movement — across BigDripUniverse, AG20 and ElmayanaConcept."
        primaryCta="Explore Artists"
        primaryHref="#roster"
        tone="ink"
      />
      <Suspense fallback={<CardGridSkeleton />}>
        <ArtistsClient artists={artists} />
      </Suspense>
      <LabelStrip />
    </div>
  );
}
