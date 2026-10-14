import { headers } from "next/headers";

/**
 * The public origin used to build absolute links that leave the server:
 * ticket URLs in emails, QR code payloads, Paystack callback URLs and
 * password-reset links.
 *
 * Order of preference:
 *   1. NEXT_PUBLIC_SITE_URL (required in production — see .env.example)
 *   2. the origin of the request being handled, when there is one
 *   3. http://localhost:3000 outside production
 *
 * In production with the variable unset and no request context (the Paystack
 * webhook, for example), this throws instead of quietly producing
 * `http://localhost:3000/...` links that the buyer and door staff cannot use.
 */
export async function siteBaseUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  if (process.env.NODE_ENV !== "production") {
    return (await requestOrigin()) ?? "http://localhost:3000";
  }

  const origin = await requestOrigin();
  if (origin) return origin;

  throw new Error(
    "NEXT_PUBLIC_SITE_URL is not set, so ticket links and QR codes would point at localhost. " +
      "Set it to your deployed URL (see .env.example)."
  );
}

async function requestOrigin(): Promise<string | null> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (!host) return null;
    const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
    return `${proto}://${host}`;
  } catch {
    // Called outside a request scope (e.g. a background job) — no origin available.
    return null;
  }
}
