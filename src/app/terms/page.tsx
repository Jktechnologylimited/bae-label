import type { Metadata } from "next";
import { FileCheck2 } from "lucide-react";
import LegalLayout, { LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that govern your use of bae.band and related services.",
};

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    body: <p>By accessing or using our website, services, or purchasing tickets to any event, you agree to be bound by these Terms &amp; Conditions and our Privacy Policy. If you do not agree, please do not use our Site or services.</p>,
  },
  {
    id: "about",
    title: "About BAE",
    body: <p>BAE is the unified brand for BigDripUniverse, AG20 and ElmayanaConcept. Through bae.band, we provide information about our artists, music, events and related content.</p>,
  },
  {
    id: "use-of-site",
    title: "Use of Our Website",
    body: <p>You agree to use our website only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else&rsquo;s use and enjoyment of the Site.</p>,
  },
  {
    id: "tickets",
    title: "Tickets and Events",
    body: (
      <p>
        All ticket purchases are subject to availability, event terms, age restrictions and venue rules. We reserve
        the right to cancel or reschedule events. Tickets are non-transferable unless stated otherwise and may not be
        resold for commercial purposes without our written consent.
      </p>
    ),
  },
  {
    id: "accounts",
    title: "User Accounts",
    body: <p>You may be required to create an account to access certain features. You are responsible for maintaining the confidentiality of your account and for all activities that occur under it.</p>,
  },
  {
    id: "ip",
    title: "Intellectual Property",
    body: <p>All content on this Site, including music, videos, images, logos, text and graphics, is the property of BAE or its licensors and is protected by copyright, trademark and other laws. You may not copy, distribute or use our content without permission.</p>,
  },
  {
    id: "user-content",
    title: "User Content",
    body: <p>If you submit, post or share any content on our website or social platforms, you grant BAE a worldwide, non-exclusive, royalty-free license to use, reproduce and distribute that content.</p>,
  },
  {
    id: "conduct",
    title: "Acceptable Use",
    body: <p>You agree not to misuse our platform, upload harmful content, attempt unauthorized access, or engage in any activity that is illegal, harmful, threatening, abusive, harassing, defamatory or otherwise objectionable.</p>,
  },
  {
    id: "payments",
    title: "Payments and Refunds",
    body: <p>We use secure third-party payment processors. Refunds are subject to our Refund Policy and the terms specified at the time of purchase.</p>,
  },
  {
    id: "third-party-links",
    title: "Third-Party Links",
    body: <p>Our website may contain links to third-party websites. We are not responsible for the content or practices of these external sites.</p>,
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    body: <p>Our website and services are provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; We do not guarantee that the Site will be uninterrupted, secure or error-free.</p>,
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    body: <p>To the fullest extent permitted by law, BAE shall not be liable for any indirect, incidental, special or consequential damages arising from your use of our Site or services.</p>,
  },
  {
    id: "indemnification",
    title: "Indemnification",
    body: <p>You agree to indemnify and hold harmless BAE, its affiliates and team members from any claims, losses or damages arising from your use of our Site or violation of these Terms.</p>,
  },
  {
    id: "governing-law",
    title: "Governing Law",
    body: <p>These Terms are governed by and construed in accordance with the laws of the State of California, United States, without regard to conflict of law principles.</p>,
  },
  {
    id: "changes",
    title: "Changes to These Terms",
    body: <p>We may update these Terms from time to time. Changes will be posted on this page with the updated date. Continued use of our Site constitutes acceptance of the updated Terms.</p>,
  },
  {
    id: "contact",
    title: "Contact Us",
    body: <p>If you have any questions about these Terms &amp; Conditions, please contact us at info@bae.band or +1 (234) 567-8900.</p>,
  },
];

export default function TermsPage() {
  return (
    <LegalLayout
      crumb="Terms & Conditions"
      icon={FileCheck2}
      title="Terms and Conditions"
      description="Please read these Terms and Conditions carefully before using our website and services."
      lastUpdated="August 16, 2026"
      sections={sections}
      contactEmail="info@bae.band"
    />
  );
}
