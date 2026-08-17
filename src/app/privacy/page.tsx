import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import LegalLayout, { LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How BAE collects, uses, shares and protects your information.",
};

const sections: LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    body: (
      <p>
        BAE (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) operates bae.band and related services
        (collectively, the &ldquo;Site&rdquo;). This Privacy Policy explains how we collect, use, disclose and
        safeguard your information when you visit the Site or engage with our services across BigDripUniverse, AG20
        and ElmayanaConcept.
      </p>
    ),
  },
  {
    id: "info-we-collect",
    title: "Information We Collect",
    body: (
      <>
        <p>We may collect the following types of information:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className="text-ink">Personal Information:</strong> name, email address, phone number, mailing address and any other information you provide to us.</li>
          <li><strong className="text-ink">Usage Data:</strong> IP address, browser type, pages visited, time spent, referring pages and other analytics data.</li>
          <li><strong className="text-ink">Event &amp; Ticket Information:</strong> details related to ticket purchases, event registrations and preferences.</li>
          <li><strong className="text-ink">Communications:</strong> messages you send us via contact forms, email or our support channels.</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    body: (
      <>
        <p>We use the information we collect to:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Provide, operate and maintain the Site and our services.</li>
          <li>Process transactions and send confirmations.</li>
          <li>Communicate with you about updates, events, releases and promotions.</li>
          <li>Improve the Site, our services and your experience.</li>
          <li>Comply with legal obligations and protect our rights.</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-share",
    title: "How We Share Your Information",
    body: (
      <>
        <p>We do not sell your personal information. We may share it with:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className="text-ink">Service Providers:</strong> trusted partners who help us operate the Site and deliver our services (e.g. payment processors, analytics).</li>
          <li><strong className="text-ink">Legal Requirements:</strong> when required by law or to protect our rights, safety or property.</li>
          <li><strong className="text-ink">Business Transfers:</strong> in connection with a merger, acquisition or sale of assets.</li>
        </ul>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and Tracking Technologies",
    body: (
      <p>
        We use cookies and similar technologies to enhance your experience, analyze Site traffic and personalize
        content. You can manage your cookie preferences through your browser settings or our cookie banner — see our{" "}
        <a href="/cookies" className="font-semibold text-ink underline underline-offset-2">Cookie Policy</a> for details.
      </p>
    ),
  },
  {
    id: "choices",
    title: "Your Choices and Rights",
    body: (
      <p>
        You have the right to access, update or delete your personal information. You may also opt out of marketing
        communications at any time by clicking the &ldquo;unsubscribe&rdquo; link in our emails.
      </p>
    ),
  },
  {
    id: "security",
    title: "Data Security",
    body: (
      <p>
        We implement appropriate technical and organizational measures to protect your information. However, no
        method of transmission over the internet is 100% secure.
      </p>
    ),
  },
  {
    id: "retention",
    title: "Data Retention",
    body: (
      <p>
        We retain your information only for as long as necessary to fulfill the purposes outlined in this Policy,
        unless a longer retention period is required or permitted by law.
      </p>
    ),
  },
  {
    id: "third-party",
    title: "Third-Party Links",
    body: <p>The Site may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites.</p>,
  },
  {
    id: "children",
    title: "Children's Privacy",
    body: <p>The Site is not intended for children under 13. We do not knowingly collect personal information from children.</p>,
  },
  {
    id: "international",
    title: "International Transfers",
    body: <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data.</p>,
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    body: <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. We encourage you to review this Policy regularly.</p>,
  },
  {
    id: "contact",
    title: "Contact Us",
    body: <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at privacy@bae.band or +1 (234) 567-8900.</p>,
  },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      crumb="Privacy Policy"
      icon={ShieldCheck}
      title="Privacy Policy"
      description="Your privacy is important to us. This Privacy Policy explains how BAE collects, uses, shares and protects your information."
      lastUpdated="August 16, 2026"
      sections={sections}
    />
  );
}
