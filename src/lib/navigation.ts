/**
 * Redirect-target validation, shared by the login form and the Google OAuth
 * routes (client-safe: no server-only imports).
 *
 * `?next=` is attacker-supplied, and it used to be passed straight to
 * `router.push` / `new URL(..., req.url)`. A value like `https://evil.example`
 * or the protocol-relative `//evil.example` therefore redirected a user off
 * site immediately after a successful login — a convincing phishing setup,
 * because the link they clicked was on the real domain.
 *
 * Only same-origin absolute paths are allowed; anything else falls back.
 */
export function safeNextPath(raw: string | null | undefined, fallback = "/account"): string {
  if (typeof raw !== "string") return fallback;

  const value = raw.trim();
  if (value === "") return fallback;

  // Must be an absolute *path* on this origin.
  if (!value.startsWith("/")) return fallback;

  // "//host" and "/\host" are both treated as protocol-relative by browsers.
  if (value.startsWith("//") || value.includes("\\")) return fallback;

  // Control characters can be used to smuggle a scheme past naive checks.
  if (/[\u0000-\u001f\u007f]/.test(value)) return fallback;

  return value;
}
