import type { Metadata } from "next";
import { Cookie } from "lucide-react";
import LegalLayout, { LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How BAE uses cookies and similar technologies on bae.band.",
};

const COOKIE_TYPES = [
  { type: "Essential Cookies", purpose: "Necessary for the website to function and cannot be switched off.", examples: "Session management, security, accessibility", duration: "Session" },
  { type: "Performance Cookies", purpose: "Help us understand how visitors interact with our website by collecting anonymous data.", examples: "Analytics, page views, click tracking", duration: "Up to 24 months" },
  { type: "Functionality Cookies", purpose: "Enable the website to remember your preferences and provide enhanced features.", examples: "Language preferences, region, saved choices", duration: "Up to 12 months" },
  { type: "Marketing Cookies", purpose: "Used to deliver relevant ads and measure the effectiveness of our campaigns.", examples: "Ad personalization, retargeting, social integrations", duration: "Up to 24 months" },
];

const sections: LegalSection[] = [
  {
    id: "what-are-cookies",
    title: "What Are Cookies?",
    body: <p>Cookies are small text files placed on your device when you visit a website. They help websites function properly, improve your experience and provide insights to website owners.</p>,
  },
  {
    id: "how-we-use",
    title: "How We Use Cookies",
    body: <p>BAE uses cookies and similar technologies to ensure our website works as intended, to enhance your experience, to analyze site performance and to support our marketing efforts.</p>,
  },
  {
    id: "types",
    title: "Types of Cookies We Use",
    body: (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-black/15 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink">
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Purpose</th>
              <th className="py-2 pr-4">Examples</th>
              <th className="py-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            {COOKIE_TYPES.map((c) => (
              <tr key={c.type} className="border-b border-black/10 align-top">
                <td className="py-3 pr-4 font-semibold text-ink">{c.type}</td>
                <td className="py-3 pr-4">{c.purpose}</td>
                <td className="py-3 pr-4">{c.examples}</td>
                <td className="py-3">{c.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "choices",
    title: "Your Choices",
    body: <p>When you visit our website for the first time, you will see a cookie banner that allows you to accept or customize your cookie preferences. You can change or withdraw your consent at any time.</p>,
  },
  {
    id: "managing",
    title: "Managing Cookies",
    body: <p>You can control or delete cookies through your browser settings. Please note that disabling certain cookies may impact your experience and limit some features of our website.</p>,
  },
  {
    id: "third-party",
    title: "Third-Party Cookies",
    body: <p>We may allow trusted third parties to place cookies on your device to help us analyze website traffic, deliver ads and improve our services. These third parties have their own privacy and cookie policies.</p>,
  },
  {
    id: "updates",
    title: "Updates to This Policy",
    body: <p>We may update this Cookie Policy from time to time to reflect changes in technology, law or our practices. The updated date at the top of this page indicates when this policy was last revised.</p>,
  },
  {
    id: "contact",
    title: "Contact Us",
    body: <p>If you have any questions about our use of cookies, please contact us at privacy@bae.band or +1 (234) 567-8900.</p>,
  },
];

export default function CookiesPage() {
  return (
    <LegalLayout
      crumb="Cookie Policy"
      icon={Cookie}
      title="Cookie Policy"
      description="This Cookie Policy explains how BAE uses cookies and similar technologies when you visit our website."
      lastUpdated="August 16, 2026"
      sections={sections}
    />
  );
}
