import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import FaqsClient from "./FaqsClient";

export const metadata: Metadata = pageMetadata({
  title: "FAQs",
  description: "Answers to common questions about BAE, our labels, events and more.",
  path: "/faqs",
});

export default function FaqsPage() {
  return <FaqsClient />;
}
