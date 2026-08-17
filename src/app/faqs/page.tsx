import type { Metadata } from "next";
import FaqsClient from "./FaqsClient";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Answers to common questions about BAE, our labels, events and more.",
};

export default function FaqsPage() {
  return <FaqsClient />;
}
