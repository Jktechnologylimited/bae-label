import type { Metadata } from "next";
import CultureClient from "./CultureClient";

export const metadata: Metadata = {
  title: "BAE Culture",
  description: "Stories, fashion, art and the lifestyle behind the BAE movement.",
};

export default function CulturePage() {
  return <CultureClient />;
}
