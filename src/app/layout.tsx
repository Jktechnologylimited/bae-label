import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ConditionalChrome from "@/components/layout/ConditionalChrome";
import WhatsAppWidget from "@/components/widgets/WhatsAppWidget";
import { getCurrentUser } from "@/lib/auth/session";
import { toSafeUser } from "@/lib/db/schema";
import { getSettings } from "@/lib/db/settings";
import { DEFAULT_DESCRIPTION, OG_IMAGE, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

const archivo = localFont({
  src: "../fonts/Archivo-Variable.ttf",
  variable: "--font-archivo",
  display: "swap",
  weight: "100 900",
});

const inter = localFont({
  src: "../fonts/Inter-Variable.ttf",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

// Every page needs to know who's logged in (Header) and the live WhatsApp
// widget config (getSettings()), both read from the database on every
// request — so nothing under this layout can be statically generated.
// Without this, Next.js still tries to prerender the built-in /_not-found
// page at build time, which would require a reachable DATABASE_URL during
// `next build` itself, not just at runtime. force-dynamic removes that
// build-time database dependency entirely.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // Resolved from the environment rather than hardcoded, so og:image and
  // canonical URLs are absolute and correct on whatever domain this runs on.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "BAE",
    "BigDripUniverse",
    "AG20",
    "ElmayanaConcept",
    "Afrobeats",
    "Nigerian music",
    "music label",
    "live events",
    "concert tickets",
    "Lagos",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    locale: "en_NG",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

/**
 * Structured data for search engines.
 *
 * `sameAs` is deliberately omitted: the social links in `src/lib/nav.ts` point
 * at bare platform domains (https://instagram.com) rather than real profiles,
 * and listing those as the organisation's profiles would send crawlers to the
 * wrong place. Add them here once the real profile URLs exist.
 */
const organisationJsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: SITE_NAME,
  alternateName: SITE_TAGLINE,
  description: DEFAULT_DESCRIPTION,
  url: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000",
  logo: `${process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"}/og.png`,
  memberOf: [
    { "@type": "Organization", name: "BigDripUniverse" },
    { "@type": "Organization", name: "AG20" },
    { "@type": "Organization", name: "ElmayanaConcept" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const safeUser = user ? toSafeUser(user) : null;
  const settings = await getSettings();

  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-ink text-paper antialiased">
        <script
          type="application/ld+json"
          // Structured data is a static object literal, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationJsonLd) }}
        />
        <Header user={safeUser} />
        <main className="flex-1">{children}</main>
        <ConditionalChrome>
          <Footer />
          <WhatsAppWidget settings={settings} />
        </ConditionalChrome>
      </body>
    </html>
  );
}
