/**
 * Customer-facing email addresses.
 *
 * These are separate from `RESEND_FROM` / `RESEND_NOTIFY_TO`, which control
 * where mail is *sent from* and where form submissions are *delivered*. These
 * are the addresses printed in the UI — footer, contact page, policies, ticket
 * support line.
 *
 * All are optional. An address left unset is treated as "not published": every
 * place that would show it hides instead of rendering an empty mailto or, worse,
 * an address that doesn't exist. Set them as NEXT_PUBLIC_* build-time values
 * (see .env.example); changing them requires a rebuild.
 */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ?? "";
export const PRESS_EMAIL = process.env.NEXT_PUBLIC_PRESS_EMAIL?.trim() ?? "";
export const PRIVACY_EMAIL = process.env.NEXT_PUBLIC_PRIVACY_EMAIL?.trim() ?? "";
export const SUBMISSIONS_EMAIL = process.env.NEXT_PUBLIC_SUBMISSIONS_EMAIL?.trim() ?? "";

/** True when an address should actually be rendered. */
export function published(address: string): boolean {
  return address.trim() !== "";
}

/**
 * Rewrites a sentence that names an address, so copy stays grammatical whether
 * or not one is configured — e.g. "email us at X" vs "use the contact form".
 */
export function emailOrForm(address: string, fallback = "use the contact form on this site"): string {
  return published(address) ? `email us at ${address}` : fallback;
}
