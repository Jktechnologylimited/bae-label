# BAE site — fixes applied

Companion to [BAE-CODE-REVIEW.md](BAE-CODE-REVIEW.md). Scope for this pass: **all 7 critical and 10 high findings**.
Medium/low findings are listed at the end as still open.

Project: `bae-site-extract/bae-site`

## Verification performed

| Check | Result |
|---|---|
| `npm install` | 436 packages, exit 0 |
| `npx tsc --noEmit` | exit 0 (baseline before changes was also 0, so no new type errors) |
| `npx eslint` | exit 0 |
| `npx next build` | compiled successfully, exit 0 |

**Not performed (per your chosen verification level):** no database connection and no live request testing, so the
exploit chains are closed by construction and by reading, not by re-running them. Nothing touched your Neon data.

**No schema migration is required.** No table or column was added or altered. The one new field on an order
(`baseUrl`) lives inside the existing `data JSONB`, and it is optional on read — existing orders without it fall back
to the site URL, and existing ticket/order ids keep working because they are only ever looked up verbatim.

---

## Critical

**C1 — Account takeover via checkout auto-login. FIXED.**
`src/app/api/checkout/route.ts`
Deleted the `setSessionCookie(...)` call for unauthenticated callers. Checkout no longer mints a session from the
posted `buyerEmail`; a session is only ever created by login, signup, password reset or Google sign-in. Guests still
check out without an account and still get an account + temporary password by email; the order is still attributed
to the matching account so the buyer sees it in `/account`.
Also: temp password widened from 6 to 12 random bytes, and a create-account race is now handled instead of 500ing.

**C2 — Free tickets via client-controlled `?dryRun=1`. FIXED.**
`src/lib/ticketing/paystack.ts`, `src/lib/ticketing/finalize.ts`, `src/app/tickets/confirm/page.tsx`
The `dryRun` parameter is gone from `finalizeOrder` and from the confirm page, and Paystack's callback URL no longer
carries a `&dryRun=1` flag. Dry-run is now decided **server-side only**: `isDryRun()` returns true only when
`PAYSTACK_SECRET_KEY` is unset *and* `NODE_ENV !== "production"`. In production a missing key throws rather than
granting free tickets.

**C3 — Unauthenticated `/api/verify`. FIXED.**
`src/app/api/verify/route.ts`, `src/app/verify/VerifyClient.tsx`
Added the same `getCurrentUser()` + `role === "admin"` guard every `/api/admin/*` route uses (the middleware matcher
deliberately still covers page paths only, so the route guard is the authority — and API callers get a proper 403
instead of an HTML redirect). `usedBy` now comes from the signed-in admin's session; the free-text "Staff Name" field
that let anyone forge the audit trail was removed from the scanner UI.

**C4 — Webhook signature verification skipped when the key is unset. FIXED.**
`src/app/api/webhooks/paystack/route.ts`
Missing `PAYSTACK_SECRET_KEY` now returns **503 in production** (fail closed) instead of silently skipping the check;
development still allows it with a loud warning. The comparison is now constant-time (`crypto.timingSafeEqual` with a
length check), the body is parsed inside a try/catch, and the missing-header case is explicit.

**C5 — Hardcoded default admin credentials, auto-seeded in production. FIXED.**
`src/lib/db/seed.ts`, `.env.example`, `README.md`
The admin account is now bootstrapped from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. In production, if they are unset, **no
admin is created** and the reason is logged — there is no fallback to a published password. The documented
`admin@bae.band` / `BaeAdmin!2026` account is now created **only when `NODE_ENV !== "production"`**. The password is
no longer written to logs. A concurrent-seed race no longer 500s.

**C6 — Session secret falls back to a public constant. FIXED.**
`src/lib/auth/token.ts`
`getSecret()` now throws in production when `SESSION_SECRET` is missing, so sessions cannot be forged with the
published fallback. The insecure default still applies outside production (with a warning) so local dev keeps working,
and a secret shorter than 32 characters logs a warning.

**C7 — One cheap paid reference could confirm unlimited expensive orders. FIXED.**
`src/lib/ticketing/finalize.ts`
`finalizeOrder(orderId)` no longer accepts a reference from the caller — it always uses the reference stored on the
order. Request-supplied `?reference=` / `?trxref=` are ignored by the confirm page. See H2 for the amount check.

---

## High

**H1 — Fractional quantities bought a fraction of a ticket and received whole ones. FIXED.**
`src/app/api/checkout/route.ts`, `src/lib/ticketing/amounts.ts`, `src/lib/ticketing/finalize.ts`
Quantities must be integers in `1..MAX_PER_TIER` (10); a bad value is a 400 rather than being skipped. Orders are
capped at 12 tier lines and 20 tickets total, and `finalizeOrder` independently refuses to issue an implausible
ticket count (so a legacy/abusive pending order in the database cannot explode either).

**H2 — No amount or currency verification. FIXED.**
`src/lib/ticketing/paystack.ts`, `src/lib/ticketing/amounts.ts`, `src/lib/ticketing/finalize.ts`,
`src/app/api/checkout/route.ts`
`verifyTransaction` now returns the paid amount and currency. Before issuing anything, `finalizeOrder` compares the
paid amount against the order's own line items and requires currency `NGN`; a mismatch logs the details and issues
nothing. Amounts are computed once, in kobo, by one shared helper (`itemsAmountKobo`) used by both the charge and the
verification, so the two can't drift.

**H3 — Ticket codes were short, sequential and enumerable. FIXED.**
`src/lib/ticketing/store.ts`
`BAE-####` (`Math.random()`, ~9,000 values) is replaced by `BAE-` + 8 random bytes as uppercase hex — 64 bits of
CSPRNG output. Codes stay uppercase so the existing `toUpperCase()` lookup normalisation still matches.
*Deliberate trade-off:* `/ticket/[code]` does **not** require a session, because tickets are delivered as emailed
links and requiring login would break that flow for guests. With unguessable codes, enumeration is no longer
feasible, which was the actual attack. Signed/expiring QR payloads remain available as defence-in-depth if you want
them (see "still open").

**H4 — Order-ID collisions (≈99% by 300 orders) broke checkout. FIXED.**
`src/lib/ticketing/store.ts`, `src/lib/db/pg.ts`
Order ids are now 64-bit random (upper hex), and `newId()` (users, events, artists, releases, news) uses 8 random
bytes instead of a 6-digit `Math.random()`. No code path parsed the old format.
*Trade-off:* ids are longer than `BAE-8923`, so the door-staff code field is longer to type — scanning the QR avoids
that. The placeholder text was updated.

**H5 — `GET /api/admin/settings` had no authentication. FIXED.**
`src/app/api/admin/settings/route.ts` — now requires an admin session like the `PATCH` beside it.

**H6 — No transactions; order marked paid before tickets existed. FIXED.**
`src/lib/db/pg.ts` (`withTransaction`), `src/lib/ticketing/store.ts`, `src/lib/ticketing/finalize.ts`
Added a transaction helper (one pooled connection, `BEGIN`/`COMMIT`/`ROLLBACK`, guaranteed `release()`).
Finalization now claims the order with a single conditional `UPDATE ... WHERE (data->>'status') <> 'paid'` and inserts
the tickets **in the same transaction**, so a webhook and the buyer's redirect racing each other produce one set of
tickets instead of a 500 or duplicates. Ticket inserts use `ON CONFLICT (code) DO NOTHING`. A transient Paystack
error no longer permanently marks an order `failed` — it returns a retryable failure and leaves the order pending,
and the webhook answers 502 so Paystack redelivers. Admin manual ticket issuance is transactional too.

**H7 — No caps and no rate limiting. PARTIALLY FIXED (capacity deferred).**
Added per-order caps (see H1) and a dependency-free in-process rate limiter (`src/lib/rateLimit.ts`) applied to
login (10/15 min), signup (5/h), forgot-password (5/15 min), reset-password (10/15 min), change-password (10/15 min),
contact (5/h), newsletter (5/h), checkout (10/10 min) and verify (120/min per admin).
**Deferred: the capacity/inventory model.** Tiers have no capacity field, so events still cannot sell out. Fixing
that means a new admin-facing field, a sold-out state in the ticket UI, and an atomic count-and-insert — a product
change rather than a bug fix, and it needs your input on how capacity should be expressed.
*Honest limitation of the limiter:* counters live in one serverless instance, so a distributed attacker spread across
many concurrent instances gets a higher effective limit. It stops scripted abuse from a single source; swap the `Map`
for Redis/Upstash when traffic justifies it.

**H8 — Ticket redemption was a non-atomic read-then-write (double entry). FIXED.**
`src/lib/ticketing/store.ts` (`claimTicketForEntry`), `src/app/api/verify/route.ts`
Redemption is now a single conditional `UPDATE ... WHERE code = $1 AND (data->>'status') = 'valid'` with the patch
merged via `data || $2::jsonb`. Exactly one of two simultaneous scans wins; the loser is told it was already used,
with the timestamp.

**H9 — Confirmation page exposed buyer PII. FIXED (enumeration eliminated; email masked).**
`src/app/tickets/confirm/page.tsx`
The page no longer reveals the full buyer address — it renders a masked form (`j••••••@example.com`) — and the order
id it is keyed on is now 64-bit random (H4), so the enumerate-orders attack is gone. The page intentionally remains
reachable without a session, because it is the post-payment landing page for guest buyers; anyone holding a specific
order URL can still see that order's own QR codes.

**H10 — Ticket links and QR codes fell back to `localhost` in production. FIXED.**
New `src/lib/site.ts` (`siteBaseUrl()`), used by `finalize.ts`, `ticket/[code]/page.tsx`, `account/page.tsx`,
`checkout/route.ts`, `forgot-password`, and both Google OAuth routes. It prefers `NEXT_PUBLIC_SITE_URL`, falls back to
the request's own origin, then to localhost outside production — and in production with no configured URL and no
request context it throws rather than emitting unusable localhost links. Checkout also stamps the purchase origin onto
the order, so webhook-driven ticket emails build correct absolute links with no request context at all.

---

## Bonus fixes made in passing (same code paths, no extra risk)

- **Google account linking now requires `email_verified`** (`api/auth/google/callback/route.ts`) — an unverified
  Google address can no longer link to an existing password account.
- **Secrets no longer written to logs**: the admin password (removed), the new-account temp password (removed), and
  ticket entry links (removed). The password-reset link is still logged for local development only, and production
  now logs an explicit error when `RESEND_API_KEY` is missing so reset mail can't fail silently.
- **Contact form** now type-checks and length-limits its fields.

## New files

| File | Purpose |
|---|---|
| `src/lib/site.ts` | Single source of truth for absolute URLs in emails/QRs/callbacks |
| `src/lib/rateLimit.ts` | Dependency-free fixed-window rate limiter + helpers |
| `src/lib/ticketing/amounts.ts` | Kobo arithmetic and purchase limits |

## Deployment checklist (action required from you)

1. **Set `ADMIN_EMAIL` and `ADMIN_PASSWORD`** — in production no admin is created without them.
2. **Set `SESSION_SECRET`** (`openssl rand -base64 32`) — the app refuses to sign sessions in production without it.
3. **Set `PAYSTACK_SECRET_KEY`** — checkout and the webhook now fail closed without it.
4. **Set `NEXT_PUBLIC_SITE_URL`** to the real deployed URL.
5. **Set `RESEND_API_KEY`** — otherwise tickets are issued but never delivered (this was already true; it matters more
   now that the temp password is no longer logged).
6. **Audit the existing admin account.** If `admin@bae.band` already exists in your database with the published
   password, this code change does **not** remove it — change its password or delete it before going live.

## Still open (unchanged from the first pass)

`M5` newsletter signup stores nothing · `M6` no general migration path · `M12` no foreign keys ·
`M16` QR points at the admin-only `/verify` page · `M17` finalization still runs during a GET render ·
`M19` dead interactive UI · `M21` cookie-consent copy · plus the low-severity list.

---

# Second pass — medium findings

Same verification: `npx tsc --noEmit`, `npx eslint` and `npx next build` all exit 0. Still no database access, so the
SQL-level changes below (`ALTER TABLE`, the `lower(email)` index, the `expires_at::timestamptz` cast, the
`data || $2::jsonb` merge) are verified by reading, not by execution — they are the main reason a runtime smoke test
is still worth doing before you ship.

| Finding | Status | What changed |
|---|---|---|
| **M1** reset tokens consumed non-atomically | **Fixed** | `consumeResetToken` is now a single `UPDATE … WHERE used = false AND expires_at::timestamptz > now() RETURNING user_id`, so two simultaneous requests can't both reset the password. |
| **M2** sessions survived a password change | **Fixed** | New `users.session_version` column (added with an idempotent `ALTER TABLE … ADD COLUMN IF NOT EXISTS`), carried in the session token as `ver` and re-checked in `getCurrentUser`. Changing or resetting a password bumps the version, killing every other session; the browser that made the change is re-issued a cookie so it stays signed in. Tokens minted before this change have no `ver` and count as version 1, so nobody is logged out by the deploy. |
| **M3** mass assignment / `id` override in admin PATCH | **Fixed** | New `src/lib/adminPayload.ts` validates every admin content payload field-by-field and rejects unknown keys and any attempt to set `id`. Applied to all 8 admin content routes (both POST and PATCH), so the raw body is never spread into a stored record. |
| **M4** unvalidated `PATCH /api/admin/settings` | **Fixed** | `pickSettingsPatch` validates each setting by type (boolean, 8–15 digit number, non-empty bounded greeting, bounded list of non-empty phrases) and rejects unknown keys. |
| **M7** case-sensitive `email UNIQUE` vs case-insensitive lookups | **Fixed** | `updateUser` now lowercases the email it writes, and a unique index on `lower(email)` is created at startup. The index is created in its own `try/catch` so that pre-existing duplicate accounts can't break startup — it logs instead. |
| **M8** pool lifecycle | **Fixed (one exception)** | The pool is cached on `globalThis` (no leak per dev hot reload), has a `pool.on("error")` handler so an idle-client error can't take the process down, and now sets `connectionTimeoutMillis`, `idleTimeoutMillis` and `statement_timeout`. **Exception:** `ssl: { rejectUnauthorized: false }` is unchanged — switching to full verification needs Neon's CA bundle, and getting it wrong means an outright database outage, so I'd rather you make that call deliberately. |
| **M10** default-password banner was always true | **Fixed** | `isFirstAdminStillDefault` now verifies the stored hash against the development default, so the warning actually disappears once the password is changed. Costs one scrypt comparison on the admin dashboard only. |
| **M11** last admin could be demoted | **Fixed** | The role route refuses to demote the final admin, with a clear message to promote someone else first. |
| **M13** upload limits checked after buffering | **Fixed** | `Content-Length` is checked before the body is parsed, the cap is 4MB (under Vercel's 4.5MB request limit), the image type is determined from the file's **magic bytes** rather than the client-declared MIME type, and `/uploads/[filename]` now sends `X-Content-Type-Options: nosniff`. No quota/delete path yet (that needs a product decision). |
| **M14** Google linking ignored `email_verified` | **Fixed** (first pass) | — |
| **M15** open redirect via `?next=` | **Fixed** | New `safeNextPath` in `src/lib/navigation.ts` accepts only same-origin absolute paths (rejecting `//host`, `/\host`, schemes and control characters). Used by the login form, the OAuth start route and the OAuth callback. |
| **M18** no error/loading/not-found boundaries | **Fixed** | Added `app/error.tsx` (with a retry action), `app/loading.tsx` and `app/not-found.tsx`. Previously any database hiccup, or any bad URL, produced the framework's bare page. |
| **M20** accessibility | **Partly fixed** | Real accessible names added to the previously placeholder-only inputs (ticket buyer details, change-password, newsletter, events search, header search, WhatsApp message box). The header "Labels" dropdown is now click/keyboard toggleable with `aria-haspopup`/`aria-expanded` and closes on Escape or navigation — it was mouse-only. `Tabs` now has `role="tablist"`/`role="tab"`, `aria-selected`, roving `tabIndex` and left/right arrow navigation. **Not done:** per-tab-list `aria-label`s on the four callers (I left the prop optional rather than churn four more files). |
| **M22** `/account` N+1 queries | **Fixed** | Added `getTicketsByOrderIds` (`WHERE order_id = ANY($1)`), and the page now loads the event catalogue once into a map. Two queries instead of two per order. Prices/QR rendering unchanged. |
| **M23** unvalidated JSON blobs | **Fixed** | Settings are normalised on read (`normalizeSettings`), so one malformed stored value can no longer 500 every page. The admin validators (M3) are the other half: events can no longer be stored with `labels: []` or a non-array `tiers`, which was the concrete crash. |
| **Low** voided ticket showed "Valid" | **Fixed** | The public ticket page now has a distinct red "Void" badge. |
| **Low** past events were purchasable | **Fixed** | Checkout rejects an event whose `status` isn't `upcoming`. |

## Deliberately not done, and why

- **M6 (migration framework) / M12 (foreign keys)** — both need real schema restructuring against a live database.
  I added exactly one additive, idempotent migration (`session_version`) to support M2, but a proper migration tool and
  FK constraints on tables that may already contain orphans are changes you should schedule, not something to slip in
  with a bug-fix pass.
- **M5 (newsletter stores nothing)**, **M16 (QR → admin-only page)**, **M19 (dead UI)**, **M21 (cookie-consent copy)**
  — each needs a product, design or legal decision from you (where do subscribers go? should the scanner page be
  public? do you want search to actually search? implement a consent banner or correct the policy?). Rewriting your
  cookie policy or redesigning interactions without asking is not my call.
- **M17 (finalization during a GET render)** — a structural change to the payment flow (make the page read-only and
  finalize from the webhook plus a POST endpoint). The *vulnerability* in that path is already closed; what remains is
  the side-effect-during-GET smell, which is worth doing carefully and separately.

## Deployment note added by this pass

The `session_version` column is applied automatically at startup (`ALTER TABLE users ADD COLUMN IF NOT EXISTS …`), so
there is still no manual migration step — but the app must be able to run DDL on your database. If your production
database user is not the owner of the `users` table, run this once by hand:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 1;
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email));
```

---

# Runtime verification (executed, not just compiled)

This is the piece that was missing from both earlier passes. Performed against a real Neon database (the
pre-launch dev database — 1 user, 0 orders, 0 tickets at the time) and **Paystack test mode**, running the
production build (`next build` + `next start`, `NODE_ENV=production`).

**Result: 24 checks, all passing** (one initially reported a failure that turned out to be a flaw in the test, not the
code — see the M2 note below).

| Area | Check | Result |
|---|---|---|
| Startup | Migrations applied automatically; `users.session_version` (integer) and `users_email_lower_idx` both created on a database that predated them | PASS |
| Startup | Homepage renders real database content in production mode (130 KB) | PASS |
| **C1** | `POST /api/checkout` with `buyerEmail: admin@bae.band` and no session → **no session cookie issued** | PASS |
| **C2** | `/tickets/confirm?order=…&dryRun=1` did not finalize; 0 ticket rows created | PASS |
| **C3** | `POST /api/verify` without a session → 403 | PASS |
| **C4** | Unsigned webhook → 401 (signature mandatory with a key present) | PASS |
| **C6** | Session cookie forged with the old hardcoded fallback secret → rejected (redirected to login) | PASS |
| Payment | Paystack **test-mode** `transaction/initialize` returned a real checkout URL for a server-priced order | PASS |
| H1 | Quantities `0.001`, `0`, `11` → 400 | PASS |
| H4 | Order id was `BAE-21677B0D8500148D` — 64-bit random, not `BAE-####` | PASS |
| H5 | `GET /api/admin/settings` → 403 anonymous, 200 with an admin session | PASS |
| H3/H8 | Manual ticket issued as `BAE-93D2983740D45468-01`; first scan `ok`, second scan `already_used` | PASS |
| M1 | Reset token: first use 200, replay 400 | PASS |
| M2 | Pre-reset session received **no account data**; the session issued by the reset worked | PASS |
| Low | Past event (e5) not purchasable → 400 | PASS |
| Cleanup | Database returned to 1 user / 0 orders / 0 tickets / 0 tokens | — |

**Behavioural note discovered by testing (not a bug, but worth knowing):** adding `app/loading.tsx` (the M18 fix) makes
protected pages stream. A redirect from a server component is therefore delivered *inside* the response body
(`login?next=/account;307`) with an HTTP status of 200, instead of as a 307 header. Browsers follow it correctly and no
protected data is served — verified by inspecting the body. But any script or uptime monitor that decides
"logged in?" from the status code alone will be misled.

**Still not verified:** the complete money→ticket path for a genuinely *successful* payment. Paystack deliberately
provides no API to mark a transaction successful, so this needs one browser checkout with a test card
(`4084 0840 8408 4081`, any future expiry, CVV `408`, PIN `0000`). Everything up to that point — order creation,
server-side pricing, the kobo amount, `initialize`, the webhook, the amount/currency check and ticket issuance into a
transaction — has now been executed for real.

**Also created during testing:** one abandoned Paystack **test-mode** transaction (harmless; visible in the test
dashboard). No live transaction, no charge, no real data touched, and all test rows were removed afterwards.

---

# Third pass — email configuration and customer-facing addresses

Requested after the runtime test: send mail from `mail.jktl.com.ng`, and publish no customer-facing address.

## What changed

- **`src/lib/contact.ts` (new)** — one place for the addresses the UI prints (contact, press, privacy,
  submissions), read from `NEXT_PUBLIC_*`. An address that is unset is *not published*: the UI hides it rather than
  rendering an empty `mailto:` or a wrong address.
- **Removed the hardcoded `bae.band` addresses** from the footer, contact page (including the FAQ answers about
  submissions, internships and licensing), the privacy, terms and cookie policies, the legal sidebar card, the
  ticket support line, and `src/lib/faqData.ts`.
- **The legal sidebar degrades gracefully** — with no address configured it links to `/contact` instead of printing
  a dead address.
- **Policy sentences stay grammatical either way** via `emailOrForm()`: "please email us at X" or "please use the
  contact form on this site".
- **`.env.example`** documents the new variables and the Resend subdomain-verification trap.

## Verified at runtime, both directions

| Scenario | Result |
|---|---|
| `NEXT_PUBLIC_CONTACT_EMAIL` set | Footer and contact page render the address (2 occurrences) |
| `NEXT_PUBLIC_CONTACT_EMAIL` blank | Footer renders no address; privacy policy reads "please use the contact form on this site"; legal sidebar shows "Use our contact form" |
| Any of `/`, `/contact`, `/privacy`, `/cookies`, `/terms` | Zero occurrences of the old `bae.band` addresses, zero `mailto:` links |

## Still outstanding (needs your input)

- **`metadataBase` is still `https://bae.band`** in `src/app/layout.tsx` — it only affects absolute URLs in social
  previews, but it should be your real domain.
- **The phone number `+1 (234) 567-8900` and "Los Angeles, CA" are still placeholder copy** in the footer, contact
  page and the legal sidebar. You didn't mention a phone number, so I left them.
- **The privacy policy still says "our cookie banner"** (`privacy/page.tsx`, section 5) although no banner exists —
  this is the M21 item from the review and still needs a decision: implement consent or correct the copy.
- **`RESEND_FROM` / `RESEND_NOTIFY_TO` still have `bae.band` fallbacks in five files.** If either variable is ever
  unset in production, mail is sent from an address on an unverified domain and the send fails. They are set in your
  `.env.local`, but the fallback should ideally fail loudly instead — say the word and I'll centralise it.

---

# Fourth pass — admin identity, and the published default credential is gone

Requested: move the admin account to `admin@bae.africa`.

## What changed

- **The account was updated in place** in the database — same user id, same role, so nothing that references it
  breaks. `session_version` was bumped, which invalidates any session issued before the change.
  `admin@bae.band` → `admin@bae.africa`.
- **A new password was generated** (18 random bytes) and written to `.env.local` as `ADMIN_PASSWORD` and hashed into
  the database. It was created in-shell and is **not** printed in this conversation. To read it, open
  `bae-site-extract/bae-site/.env.local` and look at `ADMIN_PASSWORD`, or run:
  `grep ADMIN_PASSWORD bae-site-extract/bae-site/.env.local`
  Change it from `/account` once you're in if you'd rather use your own.
- **The hardcoded development credentials are deleted from the codebase.** `seed.ts` previously fell back to
  `admin@bae.band` / `BaeAdmin!2026` when `ADMIN_EMAIL`/`ADMIN_PASSWORD` were unset, and the README printed that
  password. Both constants are gone: the bootstrap admin now *always* comes from the environment, in every
  environment. If they're unset, no admin is created and the reason is logged.
- **Removed `isFirstAdminStillDefault()` and its warning banner** on `/admin`. It existed to nag about the published
  default password; with no default password it was meaningless (and it ran a scrypt comparison on every admin
  dashboard load).
- `.env.example` and the README quick-start updated to say `ADMIN_EMAIL`/`ADMIN_PASSWORD` are required everywhere.

## Verified at runtime

| Check | Result |
|---|---|
| Log in as `admin@bae.africa` | 200, session cookie issued |
| `/admin` with that session | 200, dashboard renders |
| User object returned by login | leaks neither `passwordHash` nor `sessionVersion` |
| Log in as the old `admin@bae.band` | 401 |
| Log in with the old published password `BaeAdmin!2026` | 401 |
| `grep -rn "admin@bae.band\|BaeAdmin" src README.md .env.example` | only explanatory notes remain — no functional reference |

**This closes the last verified launch blocker** from the code review (finding C5).

## One thing this raises

Your domain appears to be **`bae.africa`**, but `metadataBase` is still `https://bae.band`
(`src/app/layout.tsx`) and the privacy/terms/cookie copy says "BAE operates bae.band". `metadataBase` only affects
absolute URLs in social previews, and the policy text is copy rather than configuration — but if `bae.africa` is the
real site, both should say so. Tell me and I'll update them (including the `NEXT_PUBLIC_SITE_URL` in your
`.env.local`, which is currently `http://localhost:3000` for local work).

---

# Fifth pass — recovery email, in-dashboard password access, lockout escape hatch

Requested: an admin should be able to nominate another email in case they forget their password, and change their
password from the dashboard.

## 1. Recovery email (new)

- New optional `users.recovery_email` column (additive, idempotent migration — applied automatically at startup).
- **`/account`** gained a **Recovery email** form (`src/app/account/RecoveryEmailForm.tsx`). Setting or clearing it
  requires your current password — without that, anyone who briefly held a session could point resets at their own
  inbox, reset the password, and keep the account permanently. It also refuses an address identical to your sign-in
  address, and validates the format.
- **`/forgot-password` now accepts either address** — your sign-in email *or* the recovery address
  (`getUserByRecoveryEmail`) — and delivers the reset link to the recovery address when one is set. That's the whole
  point of setting it: your primary address may be unreachable.
- The recovery address is excluded from `toSafeUser`, so it never reaches the browser.
- The generic "if an account exists…" response is unchanged for unknown addresses, so this adds no way to enumerate
  accounts.

## 2. Password change from the dashboard

The form already existed at `/account` — it just wasn't discoverable from `/admin`. The admin sidebar now has a
**Password & Security** entry pointing there (and the section is retitled, containing both password and recovery
email). No duplicated form.

## 3. Lockout escape hatch (new)

`scripts/reset-password.mjs`. A recovery email only helps if mail is actually being delivered, and
`/forgot-password` needs `RESEND_API_KEY` plus a verified sending domain. This script needs only `DATABASE_URL`:

```bash
node --env-file=.env.local scripts/reset-password.mjs you@example.com
```

It generates a random password, prints it once, and bumps `session_version` so existing sessions die. Documented in
the README under "Passwords, recovery and getting locked out".

## Verified at runtime

15/15 checks on the recovery-email flow, including:

| Check | Result |
|---|---|
| Wrong / missing current password | 401 / 400 |
| Unauthenticated request | 401 |
| Recovery address equal to the sign-in address | 400 |
| Malformed address | 400 |
| Valid address | 200, persisted |
| `/forgot-password` with the sign-in address | 200, token created |
| `/forgot-password` with the recovery address | 200, token created |
| Reset link routing (from the dev dry-run log) | **both** requests logged "would be sent to recovery-test@example.com" |
| Unknown address | 200 generic reply (no enumeration) |
| Clearing the address | 200, persisted as NULL |

And 3/3 on the lockout script, run against a throwaway account (not your admin): the printed password logs in (200),
the old password is rejected (401), and a session issued before the reset can no longer read the account page. The
throwaway account was deleted afterwards — the database is back to your single admin, with no recovery address set.

`tsc`, `eslint` and `next build` all pass.

## Note on the Paystack settlement account

Paystack settling directly to a business bank account is exactly how it's meant to work, and nothing in this codebase
configures or needs to know about it — the app never sees the payout account. The only caveat worth checking is that
Paystack validates the settlement account **name** against your registered business name for compliance, so a mismatch
between `A.G.Twenty` and your Paystack business profile is the one thing that can delay or reject the setup.





