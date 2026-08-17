import Hero from "@/components/sections/Hero";
import LabelsGrid from "@/components/sections/LabelsGrid";
import QuickHighlights from "@/components/sections/QuickHighlights";
import TicketBanner from "@/components/sections/TicketBanner";
import CultureStrip from "@/components/sections/CultureStrip";
import LatestNews from "@/components/sections/LatestNews";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LabelsGrid />
      <QuickHighlights />
      <TicketBanner />
      <CultureStrip />
      <LatestNews />
    </>
  );
}
