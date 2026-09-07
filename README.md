# BAE — Three Labels. One Movement.

Frontend for the BAE music label collective site (BigDripUniverse, AG20, ElmayanaConcept), built from the provided
wireframes/mockups. Next.js App Router + TypeScript + Tailwind CSS v4 + Framer Motion, ready to connect to a real
backend.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS v4** — design tokens (colors, fonts) live in `src/app/globals.css` under `@theme`
- **Framer Motion** — scroll-reveal and micro-interactions
- **Resend** — email delivery for the newsletter, contact form, and digital ticket delivery
- **Paystack** — ticket checkout (REST API, no SDK) — see "Ticketing backend" below
- **qrcode** — generates the QR code on each digital ticket
- **lucide-react** — icon set

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — see the sections below for what each var does
npm run dev
```

Visit `http://localhost:3000`. On first run, a default admin account is created automatically and logged to your
terminal:

```
[seed] Created default admin account — email: admin@bae.band  password: BaeAdmin!2026
[seed] Log in at /login and change this password immediately (see /account).
```

Log in at `/login` with those credentials to reach `/admin`. **Change that password** (or set your own admin
directly in `.data/users.json` before first run) before this ever goes near production.

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Project structure

```
src/
  app/
    page.tsx                 Home
    artists/                 Artist roster, filters, pagination
    releases/                Catalog, featured release + tracklist
    events/                  Upcoming/past events, venues (DB-backed)
    tickets/                 Event picker + live ticket quantity/price calculator + real checkout
    tickets/confirm/         Order confirmation — verifies payment, issues digital tickets
    ticket/[code]/           Public digital ticket page (QR code for entry)
    login/ signup/           Auth pages
    account/                 Customer dashboard — orders, tickets w/ QR, change password
    verify/                  Door-staff scanner: redeem a ticket, block re-use (admin-gated)
    admin/                   Admin dashboard (see "Accounts & admin" below)
    media/                   Videos, photos, playlists, podcasts (tabbed)
    culture/                 BAE Culture stories, highlights, Instagram grid
    news/                    Featured + latest news, categories, press
    about/                   Company story, impact stats, values
    contact/                 Contact form (Resend) + FAQ
    privacy/ terms/ cookies/ Legal pages (shared LegalLayout)
    faqs/                    Categorized FAQ accordion
    api/
      auth/                      signup, login, logout, change-password
      admin/                     events CRUD, ticket void, user role — all admin-gated
      newsletter/route.ts        POST { email } → Resend
      contact/route.ts           POST { name, email, subject, message } → Resend
      checkout/route.ts          POST — prices an order server-side, starts a Paystack transaction,
                                  finds-or-creates the buyer's account
      verify/route.ts            POST { code } — redeems a ticket at the door, blocks re-use
      webhooks/paystack/         POST — Paystack payment webhook (production confirmation path)
  components/
    layout/                  Header (auth-aware), Footer, AnnouncementBar, NewsletterForm, ConditionalChrome
    auth/                    LogoutButton
    brand/                   BaeMark (logo), SocialIcon
    sections/                Reusable page sections (Hero, PageHero, LabelStrip, …)
    cards/                   ArtistCard, ReleaseCard, EventCard, NewsCard
    ui/                      Button, Tabs, Select, Accordion, Placeholder, Skeleton, …
    legal/                   LegalLayout, LegalHero (shared by Privacy/Terms/Cookies)
  lib/
    data.ts                  Mock content (labels, artists, releases, news) + Event seed source
    types.ts                 Shared TypeScript types
    labelStyle.ts            Per-label Tailwind class + icon lookups
    nav.ts                   Nav links, footer columns, social links
    auth/
      token.ts               Edge-safe: signs/verifies the session cookie (Web Crypto HMAC only)
      session.ts              Node-only: cookie get/set + getCurrentUser() (does the DB lookup)
      password.ts             scrypt password hashing
    db/
      client.ts               Generic JSON-file read/write (the "database")
      schema.ts                User/SafeUser types, DbEvent alias
      users.ts                 User CRUD
      events.ts                Event CRUD — this is what /admin/events manages
      artists.ts               Artist CRUD — /admin/artists
      releases.ts               Release CRUD — /admin/releases
      news.ts                   News post CRUD — /admin/news
      seed.ts                  Bootstraps the default admin + seeds events/artists/releases/news once
    ticketing/
      store.ts                 Order/Ticket CRUD — includes issueManualTicket() for admin-issued comp tickets
      paystack.ts, qr.ts, finalize.ts   Same as before
  middleware.ts              Redirects unauthenticated/wrong-role requests away from /admin, /account, /verify
```

## Content model — what's real vs. still static

**Real / database-backed and admin-manageable:** events (with ticket tiers, pricing, labels), artists, releases
(with tracklists), news posts, orders, tickets, users. These live in `.data/*.json` (see "The data layer" below)
and are created/edited through `/admin`, not hardcoded — content an admin creates or edits shows up on the public
site immediately, no publish step.

**Still static mock content:** culture stories (on `/culture`), venues, and the three label descriptions
(BigDripUniverse/AG20/ElmayanaConcept — name, tagline, colors) — these live in `src/lib/data.ts` as before. This
was a deliberate scope call: labels rarely change (there are only three, and adding a fourth is a bigger decision
than a CRUD form), venues are minor, and culture stories are editorial content that overlaps heavily with news. To
make these real too, follow the exact pattern already used for artists/releases/news:

1. Add a `db/` module with CRUD functions (see `src/lib/db/artists.ts` as the simplest template), seeded once from
   the existing static array in `seed.ts`.
2. The consuming page is likely already a `"use client"` component importing the static array directly — convert
   it to receive that data as a prop instead, fetched server-side in its `page.tsx` (see how `ArtistsClient` /
   `artists/page.tsx` do this).
3. Add the equivalent `/admin/<thing>` list + create/edit form pages, following `/admin/artists` as the template —
   the list page, delete button, and form component are almost entirely copy-paste-adjust.

`formatNaira()` in `data.ts` formats ticket prices — swap for your real currency/locale as needed.

## Accounts & admin

There are two account roles: **customer** and **admin**.

- **Customers** can sign up at `/signup`, or an account is created for them automatically the first time they check
  out with a new email (standard ticketing UX — no forced signup before buying). Either way, `/account` shows their
  order history and every ticket they own, each with its live status (valid / used / void) and QR code, and lets
  them change their password.
- **Admins** log in at the same `/login` and land on `/admin` — a dashboard covering the proposal's "Event
  Management" section and then some: an overview (revenue, orders, tickets sold/scanned, upcoming events), full
  CRUD on **events** (name, date, venue, labels, description, dynamic ticket tiers), **artists** (name, genre,
  label, bio, status), **releases** (title, artist, label, type, year, blurb, dynamic tracklist), and **news**
  posts (title, category, excerpt, date, read time) — each with a list page, create/edit forms, and delete. There's
  also a tickets list with **issue** (manual/comp ticket), **edit** (holder name, tier, status), **void**, and
  **delete** actions, a read-only orders list, and a users list where an admin can promote another account.
  Anything created or edited here shows up on the public site immediately — there's no separate "publish" step.
- `middleware.ts` redirects unauthenticated requests to `/admin`, `/account`, or `/verify` to `/login`, and redirects
  a non-admin away from `/admin` — but every one of those routes/API handlers also independently re-checks the
  session server-side (see `getCurrentUser()`), so the middleware redirect is a UX nicety, not the only thing
  standing between a request and the data.
- Sessions are a signed, httpOnly cookie (HMAC-SHA256) — no session table, so nothing to clean up, but also no way
  to revoke a single session early short of rotating `SESSION_SECRET` (which invalidates all of them). That's a
  reasonable trade for an MVP; swap for DB-backed sessions if you need per-session revocation later.
- Set a real `SESSION_SECRET` in `.env.local` before deploying — without one, a loud console warning fires and an
  insecure hardcoded fallback is used so local dev still works.

## Connecting Resend

The newsletter signup (in the footer and a few CTA bands) and the contact form on `/contact` both POST to local API
routes (`/api/newsletter`, `/api/contact`) that are already wired for [Resend](https://resend.com):

1. Create a Resend account and verify a sending domain.
2. Copy `.env.example` to `.env.local` and fill in:
   - `RESEND_API_KEY`
   - `RESEND_FROM` — must be on your verified domain
   - `RESEND_NOTIFY_TO` — inbox that receives signups/messages
3. Without an API key set, both routes still return success and just `console.log` the payload — so the UI is fully
   testable before the backend is live.
4. Where the code says `// TODO`, that's where you'd persist newsletter subscribers to a real mailing list
   (Resend Audiences, a CRM, etc.) instead of only emailing a notification.

## Ticketing backend — how it works

`/tickets` has a **real, working** purchase flow: select a show and quantity → enter your details →
`/api/checkout` prices the order server-side, finds-or-creates the buyer's account and signs them in, and starts a
Paystack transaction → Paystack redirects back to `/tickets/confirm` → payment is verified and digital tickets
(with QR codes) are issued and emailed → each ticket lives at a public URL (`/ticket/[code]`) *and* shows up on the
buyer's `/account` dashboard → door staff redeem it at `/verify` (admin-only), which blocks re-scanning an
already-used ticket. This matches the flow in JK Technology's proposal: **Public Event Website → Online Ticket
Sales → Digital Tickets → Event Verification** — plus accounts on both sides (buyer and admin), which the proposal
didn't originally scope but were requested afterward.

### Connecting Paystack

1. Create a [Paystack](https://paystack.com) account (test mode is fine to start).
2. Add to `.env.local`:
   - `PAYSTACK_SECRET_KEY` — from your Paystack dashboard
   - `NEXT_PUBLIC_SITE_URL` — your real deployed URL in production (used to build the Paystack callback URL, ticket
     QR codes, and the emailed ticket links)
3. In the Paystack dashboard, point your webhook URL at `https://yourdomain.com/api/webhooks/paystack`. The webhook
   is the reliable, production-grade confirmation path — the redirect to `/tickets/confirm` is a good UX but isn't
   guaranteed to fire (the buyer might close the tab), so the webhook is what should be trusted to actually issue
   tickets in production.
4. Without `PAYSTACK_SECRET_KEY` set, checkout runs in **dry run mode**: it skips Paystack entirely and redirects
   straight to the confirmation page, which finalizes the order as if payment succeeded. This is what let me test
   the entire purchase → ticket → verification loop end-to-end without a real payment account — I ran it twice
   during development (two different events, different ticket tiers, different buyers) and confirmed: order pricing
   computed correctly server-side, tickets issued with working QR codes, first scan at `/verify` approved entry,
   second scan of the same ticket was correctly rejected as already-used, and a bogus code was correctly rejected
   as invalid.
5. **Important:** the live Paystack API calls (`initialize`/`verify` in `src/lib/ticketing/paystack.ts`) are written
   to Paystack's documented spec but were **not** exercised against the real API while building this — this sandbox
   can't reach `paystack.co`. Test with a real test-mode secret key before trusting it with real money.

### The data layer — dev-only, replace before launch

Orders and tickets are stored as JSON files in `.data/` (gitignored) via `src/lib/ticketing/store.ts`. This is
deliberately simple so the full flow works locally with zero setup, but it **will not work in production** on a
serverless host like Vercel (the filesystem isn't shared or persistent across function invocations). This is
exactly the piece the proposal's "Database" line item is for — before going live, swap `store.ts` for a real
database (Postgres via Prisma/Drizzle, Supabase, etc.). Every function in that file is already `async`, so call
sites elsewhere won't need to change.

### Door verification (`/verify`)

This page is gated to admin accounts only (enforced by both `middleware.ts` and the route handler itself) — a
non-admin or logged-out visitor is redirected to `/login`. A ticket's QR code encodes a URL (`/verify?code=...`),
so any phone's native camera app can scan it and open the page with the code pre-filled; there's also a manual
entry field for typing a code in directly. Scanning calls `POST /api/verify`, which looks the ticket up, rejects
unknown codes, rejects tickets already marked used (showing when/who scanned it) or voided, and otherwise marks it
used and approves entry. Note that everyone scanning tickets currently needs a full admin account (which also
grants access to `/admin`) — there's no lighter-weight "door staff" role. If you want bouncers to be able to scan
without also being able to edit events/pricing, that'd be a good next role to add (see `Role` in
`src/lib/db/schema.ts`).

## Design notes

- Color tokens, font variables and a couple of custom utilities (`.bg-grain`, `.text-stroke`) are defined once in
  `src/app/globals.css` under `@theme` — Tailwind v4 auto-generates utility classes from these (e.g. `bg-ink`,
  `text-gold`, `border-bigdrip`).
- Fonts (Archivo + Inter) are self-hosted via `next/font/local` from `src/fonts/` rather than `next/font/google`, so
  the build has no external network dependency at build time.
- `Placeholder` (`src/components/ui/Placeholder.tsx`) renders the gradient/pattern art standing in for photography —
  swap it for real `next/image` usage once you have artist photos, event photography, etc.
- The Home page uses a permanent dark theme; every interior page uses a light theme with a dark header/footer — this
  matches the two visual modes in the original mockups.

## Known gaps / next steps

- Only one admin role — see the door-verification note above about a lighter "staff" role for door scanning
  without full content-editing access.
- No password reset ("forgot password") flow yet — an admin can't currently help a locked-out customer except by
  resetting their password directly in `.data/users.json`, which isn't a real workflow. Worth adding before launch.
- The whole `db/` and `ticketing/` data layer is dev-only JSON files, not a production database — see "The data
  layer" above. This is the single biggest thing to replace before this goes live for a real event.
- Paystack integration is written to spec but hasn't been exercised against the live API (no network access to
  `paystack.co` from the environment this was built in) — test with a real test-mode key before launch.
- Culture stories, venues and label descriptions are still static — see "Content model" above for how to extend
  the same admin-CRUD pattern to them.
- No image uploads anywhere — artists/releases/news/events all still render the gradient `Placeholder` art in
  place of real photos, since there's no media storage wired up yet. Adding real images means picking a storage
  provider (S3, Cloudinary, Vercel Blob, etc.) and adding an upload field to each admin form.
- No automated tests yet.
- Every page is now server-rendered per-request (rather than statically generated) because the header needs to know
  who's logged in on every request — expected and correct, just worth knowing if you're benchmarking response times.

## Mapping this to the JK Technology proposal

If you're reading this alongside the "Upcoming Show — Digital Event Platform" proposal: the **application code**
above covers the event website, online ticket sales, digital tickets and QR verification described in sections 2–4.
What it doesn't include is the **infrastructure** in section 6 — domain, SSL, hosting, a production database, and
business email — that's still needed to actually put this live at a real URL, and is exactly what that line item
covers. The `.env.example` / README setup above is the "configuration" work referenced in section 8, ready to hand
to whoever provisions that infrastructure.
