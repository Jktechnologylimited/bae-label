# BAE — Three Labels. One Movement.

Frontend for the BAE music label collective site (BigDripUniverse, AG20, ElmayanaConcept), built from the provided
wireframes/mockups. Next.js App Router + TypeScript + Tailwind CSS v4 + Framer Motion, ready to connect to a real
backend.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS v4** — design tokens (colors, fonts) live in `src/app/globals.css` under `@theme`
- **Framer Motion** — scroll-reveal and micro-interactions
- **Resend** — email delivery for the newsletter and contact forms
- **lucide-react** — icon set

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — see "Connecting Resend" below
npm run dev
```

Visit `http://localhost:3000`.

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
    events/                  Upcoming/past events, venues
    tickets/                 Event picker + live ticket quantity/price calculator
    media/                   Videos, photos, playlists, podcasts (tabbed)
    culture/                 BAE Culture stories, highlights, Instagram grid
    news/                    Featured + latest news, categories, press
    about/                   Company story, impact stats, values
    contact/                 Contact form (Resend) + FAQ
    privacy/ terms/ cookies/ Legal pages (shared LegalLayout)
    faqs/                    Categorized FAQ accordion
    api/
      newsletter/route.ts    POST { email } → Resend
      contact/route.ts       POST { name, email, subject, message } → Resend
  components/
    layout/                  Header, Footer, AnnouncementBar, NewsletterForm
    brand/                   BaeMark (logo), SocialIcon
    sections/                Reusable page sections (Hero, PageHero, LabelStrip, …)
    cards/                   ArtistCard, ReleaseCard, EventCard, NewsCard
    ui/                      Button, Tabs, Select, Accordion, Placeholder, Skeleton, …
    legal/                   LegalLayout, LegalHero (shared by Privacy/Terms/Cookies)
  lib/
    data.ts                  Mock content (labels, artists, releases, events, news)
    types.ts                 Shared TypeScript types
    labelStyle.ts             Per-label Tailwind class + icon lookups
    nav.ts                   Nav links, footer columns, social links
```

## Content model — swapping in real data

Everything currently renders from the static mock data in `src/lib/data.ts` (`LABELS`, `ARTISTS`, `RELEASES`,
`EVENTS`, `NEWS`, `CULTURE_STORIES`, `VENUES`). To connect a real backend or CMS:

1. Replace the exported arrays in `data.ts` with fetch calls (e.g. to your API, a headless CMS, or a database via
   Server Components), keeping the same shapes defined in `src/lib/types.ts`.
2. Pages that read data client-side (`ArtistsClient`, `ReleasesClient`, `EventsClient`, `TicketsClient`, etc.) can
   either receive it as props from a Server Component parent, or fetch it themselves via a route handler.
3. `formatNaira()` in `data.ts` formats ticket prices — swap for your real currency/locale as needed.

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

## Ticketing — what's mocked vs. real

`/tickets` has a fully working ticket quantity selector and live price calculator (see `TicketsClient.tsx`), but
"Proceed to Checkout" doesn't charge anything yet — there's no payment processor wired up. To go live you'd:

- Swap `EVENTS` in `data.ts` for real event/ticket-tier data from your backend.
- Replace the checkout button's handler with a call to your payment provider (Paystack is referenced in the original
  designs, but Stripe or any other processor would drop in the same way) and create an `/api/checkout` route.

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

- No authentication, user accounts, or the admin "Owner Command Center" dashboard shown in the mockups — those were
  out of scope for this pass and would be a good next milestone once a backend exists.
- No real payment processing on `/tickets`.
- No CMS — all content is static/mock data in `src/lib/data.ts`.
- No automated tests yet.
