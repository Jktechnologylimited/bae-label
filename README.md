# BAE — Three Labels. One Movement.

Frontend for the BAE music label collective site (BigDripUniverse, AG20, ElmayanaConcept), built from the provided
wireframes/mockups. Next.js App Router + TypeScript + Tailwind CSS v4 + Framer Motion, ready to connect to a real
backend.

**This README is developer/technical documentation** — setup, architecture, environment variables. For a
plain-English guide to actually *using* the site day to day (adding shows and pricing, managing artists/releases/
news, issuing tickets, configuring the WhatsApp widget, and more), log in as an admin and go to **Admin → 
Documentation** (`/admin/docs`) — it's built into the app itself so it's always one click away for whoever's
running the site.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS v4** — design tokens (colors, fonts) live in `src/app/globals.css` under `@theme`
- **Framer Motion** — scroll-reveal and micro-interactions
- **Resend** — email delivery for the newsletter, contact form, and digital ticket delivery
- **Paystack** — ticket checkout (REST API, no SDK) — see "Ticketing backend" below
- **Google OAuth 2.0** — "Continue with Google" (hand-rolled, no SDK) — see "Connecting Google Sign-In" below
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
    admin/docs/              In-app operator guide — "how to use this" for whoever runs the site day to day
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
    brand/                   BaeMark (logo), SocialIcon, StreamingIcon (Spotify/Apple Music/etc.)
    admin/                   ImageUpload (shared by all four admin content forms)
    widgets/                 WhatsAppWidget — floating chat button + Chat/FAQ panel
    sections/                Reusable page sections (Hero, PageHero, LabelStrip, …)
    cards/                   ArtistCard, ReleaseCard, EventCard, NewsCard, StreamingLinks
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
      settings.ts               Singleton site settings (WhatsApp widget config) — /admin/settings
      seed.ts                  Bootstraps the default admin + seeds events/artists/releases/news once
    ticketing/
      store.ts                 Order/Ticket CRUD — includes issueManualTicket() for admin-issued comp tickets
      paystack.ts, qr.ts, finalize.ts   Same as before
  middleware.ts              Redirects unauthenticated/wrong-role requests away from /admin, /account, /verify
```

## Content model — what's real vs. still static

**Real / database-backed and admin-manageable:** events (with ticket tiers, pricing, labels), artists, releases
(with tracklists **and streaming platform links** — see "Streaming links" below), news posts, orders, tickets,
users, and site-wide settings (currently just the WhatsApp widget config — see "WhatsApp chat widget" below). These
live in `.data/*.json` (see "The data layer" below) and are created/edited through `/admin`, not hardcoded —
content an admin creates or edits shows up on the public site immediately, no publish step.

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
- Forgotten your password? `/forgot-password` emails a reset link (Resend, dry-run-logged if no API key is set)
  that's valid for 1 hour and single-use — see "Connecting Resend" below. This works for both customer and admin
  accounts.
- "Continue with Google" is on both `/login` and `/signup` — see "Connecting Google Sign-In" below for setup. A
  Google-linked account has no local password; `/account` shows a "Set a password" link (routed through the same
  forgot-password flow) instead of a change-password form for those accounts.

## Connecting Google Sign-In

1. Create a project at [Google Cloud Console](https://console.cloud.google.com), then **APIs & Services → OAuth
   consent screen** — fill in an app name and your email (a couple of minutes, no approval needed for basic login).
2. **APIs & Services → Credentials → Create Credentials → OAuth Client ID**, type **Web application**.
3. Add an **Authorized redirect URI**: `${NEXT_PUBLIC_SITE_URL}/api/auth/google/callback` — for local dev that's
   `http://localhost:3000/api/auth/google/callback`.
4. Copy the generated Client ID and Client Secret into `.env.local` as `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
5. Without these set, clicking "Continue with Google" redirects straight back to `/login` with a clear "Google
   sign-in isn't set up yet" message rather than erroring — safe to leave unconfigured while developing.

**How it works:** `/api/auth/google` redirects to Google's consent screen with a random `state` value stored in a
short-lived cookie (CSRF protection); `/api/auth/google/callback` verifies that state matches, exchanges the
returned code for an access token, fetches the profile (email, name, picture) from Google's userinfo endpoint, and
either logs in an existing account (matched by Google ID, or by email if a password account with that email already
exists — it gets linked rather than duplicated) or creates a new customer account. See
`src/app/api/auth/google/callback/route.ts` for the full flow.

**Important — not tested live:** this sandbox has no network access to `accounts.google.com` or `oauth2.googleapis.com`,
so this flow is written exactly to Google's documented OAuth 2.0 spec but has **not** been exercised against the
real API. Before trusting it, test the full loop with real credentials: click "Continue with Google" → approve on
Google's real consent screen → confirm you land on `/account` (or `/admin` if that Google email matches an admin
account) → confirm a `User` record was created in `.data/users.json` with a `googleId` and `avatarUrl` set.

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

## Image uploads

Every admin content form (Artists, Releases, Events, News) has an image field — click to upload a JPG/PNG/WebP/GIF
up to 5MB. The uploaded photo replaces the gradient `Placeholder` art everywhere that content is shown publicly
(cards, detail pages) immediately, no extra step.

**How it's wired, and a real bug this surfaced:** uploads are saved to `.data/uploads/` (not `public/uploads/`) and
served back at `/uploads/<file>` through a dynamic route handler (`src/app/uploads/[filename]/route.ts`) that reads
the file from disk on each request, rather than through Next's static `public/` file serving. This wasn't the
original design — the first version wrote straight to `public/uploads/`, and testing it against a production build
(`next build && next start`) surfaced a real problem: Next's production server builds its list of servable
`public/` files at boot and does **not** pick up files written there while the process is running, so a freshly
uploaded image 404'd until the server was restarted. Routing through a normal dynamic route instead sidesteps that
entirely, since it's just a per-request disk read rather than a static-asset lookup. Confirmed with a live test:
upload → fetch immediately, same running server, no restart → 200. The route also strips path components from the
filename before touching disk, so a request like `/uploads/../../.env` 404s instead of leaking files.

**Same caveat as everything else file-based here:** this still writes to the local filesystem, so it won't persist
on a serverless host with an ephemeral filesystem (e.g. Vercel) — same as `.data/*.json`. Before going live, swap
the upload route for a real object storage provider (S3, Cloudinary, Vercel Blob, etc.); the response shape
(`{ url }`) stays the same, so `ImageUpload.tsx` and every form using it won't need to change.

## Streaming links

Each release in `/admin/releases` has a "Streaming Links" section — pick a platform (Spotify, Apple Music, YouTube
Music, Audiomack, Boomplay, SoundCloud) and paste the song's URL, add as many as apply. These show up as small
branded icon links on release cards across the site, and as full labeled buttons on the "Featured Release"
spotlight on `/releases` (replacing the generic "Listen Now" button once at least one link is set). Icons and
brand colors live in `src/components/brand/StreamingIcon.tsx` — add a new platform there and to the
`StreamingPlatform` type in `src/lib/types.ts` if you need one not already listed.

## WhatsApp chat widget

A floating WhatsApp-branded chat button appears on every public page (bottom-right), building on the original
support-widget concept from the early mockups but implemented as a real, interactive component rather than a
static link. Configure it at **Admin → Settings**: turn it on/off, set the WhatsApp number (digits only, country
code first — e.g. `2348012345678`), the greeting message, and a list of quick-reply prompts.

Opening the widget shows two tabs:

- **Chat** — the greeting message, clickable quick-reply prompts that populate the message box, and a send button
  that opens `wa.me/<number>` in a new tab with the message pre-filled. There's no way to have an actual embedded
  WhatsApp conversation on a website without WhatsApp's Business Platform API (a separate paid Meta integration,
  out of scope here) — this hands off to the real WhatsApp app/web the same way the vast majority of "WhatsApp
  widgets" on real business sites work.
- **FAQ** — an inline accordion pulling from the same question set as `/faqs` (`src/lib/faqData.ts` — mark an
  entry `widgetPriority: true` to have it surface first in the compact widget view), so visitors can self-serve an
  answer before escalating to a real chat. Ends with a "Still need help? Chat with us" button that switches back to
  the Chat tab.

A small teaser bubble appears a few seconds after page load (once, dismissible) to draw attention to the widget
without being intrusive. The widget is hidden on `/admin`, `/login`, `/signup`, `/verify`, and the password-reset
pages — see `ConditionalChrome` — same as the header/footer.

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
- The whole `db/` and `ticketing/` data layer, plus image uploads, are dev-only local filesystem storage, not
  production-grade infrastructure — see "The data layer" and "Image uploads" above. This is the single biggest
  thing to replace before this goes live for a real event.
- Paystack integration is written to spec but hasn't been exercised against the live API (no network access to
  `paystack.co` from the environment this was built in) — test with a real test-mode key before launch.
- Google sign-in is likewise written to spec but not exercised live (no network access to Google's OAuth endpoints
  here) — test the full consent-screen round trip with real credentials before relying on it.
- Culture stories, venues and label descriptions are still static — see "Content model" above for how to extend
  the same admin-CRUD pattern to them.
- The WhatsApp widget hands off to `wa.me` rather than hosting a real embedded conversation — that would require
  WhatsApp's Business Platform API (a separate paid Meta integration with phone number verification), out of scope
  here. This is the standard pattern for website WhatsApp widgets, not a shortcut specific to this build.
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
