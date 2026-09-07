import Hero from "@/components/sections/Hero";
import LabelsGrid from "@/components/sections/LabelsGrid";
import QuickHighlights from "@/components/sections/QuickHighlights";
import TicketBanner from "@/components/sections/TicketBanner";
import CultureStrip from "@/components/sections/CultureStrip";
import LatestNews from "@/components/sections/LatestNews";
import { listEvents } from "@/lib/db/events";
import { listArtists } from "@/lib/db/artists";
import { listReleases } from "@/lib/db/releases";
import { listNews } from "@/lib/db/news";

export default async function HomePage() {
  const [events, artists, releases, news] = await Promise.all([
    listEvents(),
    listArtists(),
    listReleases(),
    listNews(),
  ]);

  return (
    <>
      <Hero />
      <LabelsGrid />
      <QuickHighlights events={events} artists={artists} releases={releases} />
      <TicketBanner />
      <CultureStrip />
      <LatestNews news={news} />
    </>
  );
}
