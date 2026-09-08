export interface Faq {
  q: string;
  a: string;
  category: string;
  /** Shown first in the compact widget FAQ tab — the handful of questions
   * people are most likely to want answered instantly rather than escalate
   * to chat. The full list still appears on /faqs. */
  widgetPriority?: boolean;
}

export const FAQS: Faq[] = [
  { category: "About BAE", q: "What is BAE?", a: "BAE is a music label collective uniting three labels — BigDripUniverse, AG20 and ElmayanaConcept — under one shared vision for music and culture." },
  { category: "About BAE", q: "Which labels are under BAE?", a: "BigDripUniverse, AG20 and ElmayanaConcept, each with its own sound, artists and identity." },
  { category: "Music & Releases", q: "How can I listen to music from BAE artists?", a: "All releases are available on major streaming platforms including Spotify, Apple Music and YouTube — find links on each release or artist page.", widgetPriority: true },
  { category: "Artists", q: "How can I become an artist on one of your labels?", a: "Submit your music through our Contact page and our A&R team will review it. We accept submissions on a rolling basis." },
  { category: "Music & Releases", q: "How do I submit my music?", a: "Send a streaming link and a short bio via the contact form and select \"Submission\" as your subject.", widgetPriority: true },
  { category: "Events & Tickets", q: "Where can I buy tickets for events?", a: "Tickets are available on our Get Tickets page for all upcoming shows across our three labels.", widgetPriority: true },
  { category: "Events & Tickets", q: "Can I get a refund for my ticket?", a: "Refunds are available up to 48 hours before an event. See our Terms & Conditions for full details.", widgetPriority: true },
  { category: "Events & Tickets", q: "Do you offer VIP or table reservations?", a: "Yes, most events include VIP and VVIP tiers with perks like priority entry and meet & greets — select these on the ticket page." },
  { category: "Collaborations", q: "How can I collaborate with BAE?", a: "We welcome collaborations with brands, artists and creatives. Reach out through our Contact page with your proposal." },
  { category: "Collaborations", q: "Can I license music from BAE?", a: "Yes — for sync and licensing requests, contact press@bae.band with details on the intended use." },
  { category: "Support", q: "How do I contact BAE for press or media inquiries?", a: "Email press@bae.band for interviews, press kits and media requests." },
  { category: "Support", q: "How can I stay updated on BAE news and releases?", a: "Subscribe to our newsletter at the bottom of any page, or follow us on Instagram, X, YouTube, TikTok and Spotify." },
];
