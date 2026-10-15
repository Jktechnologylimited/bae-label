import type { Metadata } from "next";

export const SITE_NAME = "BAE";
export const SITE_TAGLINE = "Three Labels. One Movement.";
export const OG_IMAGE = "/og.png";

export const DEFAULT_DESCRIPTION =
  "BAE is a music label collective uniting BigDripUniverse, AG20 and ElmayanaConcept — artists, releases, live shows and culture. Three labels, different sounds, one vision.";

const OG_IMAGE_META = { url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} — ${SITE_TAGLINE}` };

/**
 * Per-page metadata.
 *
 * Without this, only the root layout declared Open Graph tags, so every shared
 * link — a release, a show, the FAQs — previewed with the homepage's title and
 * description. Each page now supplies its own, plus a canonical URL so the
 * same content isn't indexed under several addresses.
 */
export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  /** Route path, e.g. "/events". Used for the canonical URL and og:url. */
  path: string;
  /** Keep out of search results (auth pages, private ticket views, ...). */
  noIndex?: boolean;
}): Metadata {
  const ogTitle = title === SITE_TAGLINE ? `${SITE_NAME} — ${SITE_TAGLINE}` : `${title} — ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: ogTitle,
      description,
      url: path,
      images: [OG_IMAGE_META],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [OG_IMAGE],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
