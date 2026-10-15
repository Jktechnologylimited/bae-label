import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import CultureClient from "./CultureClient";

export const metadata: Metadata = pageMetadata({
  title: "BAE Culture",
  description: "Stories, fashion, art and the lifestyle behind the BAE movement.",
  path: "/culture",
});

export default function CulturePage() {
  return <CultureClient />;
}
