import { Artist, BaeEvent, CultureStory, Label, NewsPost, Release } from "./types";

export const LABELS: Label[] = [
  {
    slug: "bigdripuniverse",
    name: "BigDripUniverse",
    wordmark: "BiG DRiP",
    tagline: "Pushing boundaries. Big energy. Global impact.",
    description:
      "The sound of the streets and the future. BigDripUniverse is where bold artists and bigger ideas collide — trap, drill and Afro-fusion built for arenas.",
    color: "#E4342F",
    colorSoft: "rgba(228,52,47,0.12)",
    artistCount: 58,
  },
  {
    slug: "ag20",
    name: "AG20",
    wordmark: "AG20",
    tagline: "Authentic. Gritty. Unapologetic.",
    description:
      "Real stories, real music. AG20 is the home of timeless songwriting and next-generation hits — R&B and soul with no filter.",
    color: "#2F6FEF",
    colorSoft: "rgba(47,111,239,0.12)",
    artistCount: 46,
  },
  {
    slug: "elmayanaconcept",
    name: "ElmayanaConcept",
    wordmark: "ELMAYANA",
    tagline: "Creative minds. New vibes. The culture, redefined.",
    description:
      "Art, expression, elevation. ElmayanaConcept is where genre-blending creatives push Afrobeats, alté and electronic sound into new territory.",
    color: "#1FB558",
    colorSoft: "rgba(31,181,88,0.14)",
    artistCount: 51,
  },
];

export const ARTISTS: Artist[] = [
  { id: "a1", name: "Tunde Vega", genre: "Trap / Drill", label: "bigdripuniverse", status: "active", bio: "Lagos-born rapper known for razor-edged verses over maximalist production." },
  { id: "a2", name: "Kessie", genre: "Afro-Fusion", label: "bigdripuniverse", status: "new", bio: "A rising voice merging highlife melodies with modern trap drums." },
  { id: "a3", name: "Marlo Reign", genre: "Hip-Hop", label: "bigdripuniverse", status: "active", bio: "Producer-rapper hybrid whose beats have shaped BigDrip's signature low end." },
  { id: "a4", name: "Nyra James", genre: "R&B / Soul", label: "ag20", status: "active", bio: "A honeyed alto voice writing unflinchingly about love and self-repair." },
  { id: "a5", name: "Deshawn Cole", genre: "Neo-Soul", label: "ag20", status: "active", bio: "Guitar-led songwriter bringing live-band warmth back to R&B." },
  { id: "a6", name: "Alaya Rowe", genre: "R&B", label: "ag20", status: "new", bio: "AG20's newest signee, discovered through a viral open-mic clip." },
  { id: "a7", name: "Femi Sola", genre: "Afrobeats", label: "elmayanaconcept", status: "active", bio: "Genre-blurring producer known for lush, percussive Afrobeats records." },
  { id: "a8", name: "Nadia Cruz", genre: "Alté", label: "elmayanaconcept", status: "active", bio: "Alté pioneer whose visuals are as talked-about as her records." },
  { id: "a9", name: "Obi Waves", genre: "Electronic / Afro", label: "elmayanaconcept", status: "new", bio: "DJ-producer fusing amapiano rhythms with ambient electronic textures." },
  { id: "a10", name: "Ricochet", genre: "Drill", label: "bigdripuniverse", status: "active", bio: "The label's most streamed drill act, known for relentless touring." },
  { id: "a11", name: "Bellamy Grace", genre: "R&B", label: "ag20", status: "active", bio: "A songwriter's songwriter, credited on records across all three labels." },
  { id: "a12", name: "Koje", genre: "Afrobeats", label: "elmayanaconcept", status: "active", bio: "Melodic Afrobeats star with three consecutive continental hits." },
];

export const RELEASES: Release[] = [
  {
    id: "r1", title: "Concrete Halo", artist: "Tunde Vega", label: "bigdripuniverse", type: "Album",
    trackCount: 14, year: 2025, blurb: "A powerful body of work that defines the sound of the movement.",
    tracks: [
      { title: "Concrete Halo (Intro)", duration: "02:14" },
      { title: "No Ceilings", duration: "03:21" },
      { title: "Drip Season", duration: "03:45" },
      { title: "Low End Theory", duration: "04:02" },
      { title: "Glass City", duration: "03:10" },
    ],
  },
  { id: "r2", title: "Elevate", artist: "Nyra James", label: "ag20", type: "Single", trackCount: 1, year: 2025, blurb: "A slow-burn single about outgrowing who you used to be.", tracks: [{ title: "Elevate", duration: "03:38" }] },
  { id: "r3", title: "Different Life", artist: "Nadia Cruz", label: "elmayanaconcept", type: "EP", trackCount: 6, year: 2025, blurb: "Six tracks of alté-electronic hybrids recorded live in Lagos.", tracks: [
      { title: "Different Life", duration: "03:12" },
      { title: "Water Sign", duration: "02:58" },
      { title: "Mirror Talk", duration: "03:40" },
      { title: "Overgrown", duration: "04:05" },
      { title: "Low Light", duration: "03:21" },
      { title: "Different Life (Reprise)", duration: "01:52" },
    ] },
  { id: "r4", title: "No Turning Back", artist: "Ricochet", label: "bigdripuniverse", type: "Single", trackCount: 1, year: 2025, blurb: "The drill anthem that soundtracked BAE Summer Wave.", tracks: [{ title: "No Turning Back", duration: "03:05" }] },
  { id: "r5", title: "Bloomfield", artist: "Deshawn Cole", label: "ag20", type: "Album", trackCount: 12, year: 2025, blurb: "A neo-soul record built around a live rhythm section.", tracks: [
      { title: "Bloomfield", duration: "03:44" },
      { title: "Slow Hours", duration: "04:12" },
      { title: "Keep", duration: "03:29" },
      { title: "Homegrown", duration: "03:58" },
      { title: "Say Less", duration: "02:47" },
    ] },
  { id: "r6", title: "Alpha State", artist: "Marlo Reign", label: "bigdripuniverse", type: "EP", trackCount: 7, year: 2024, blurb: "Seven tracks of maximalist production and razor verses.", tracks: [
      { title: "Alpha State (Intro)", duration: "01:48" },
      { title: "Blackout", duration: "03:15" },
      { title: "Static", duration: "02:56" },
    ] },
  { id: "r7", title: "Dreams (Visualizer)", artist: "Alaya Rowe", label: "ag20", type: "Single", trackCount: 1, year: 2025, blurb: "AG20's breakout debut single, out now on all platforms.", tracks: [{ title: "Dreams", duration: "03:22" }] },
  { id: "r8", title: "Gold Standard", artist: "Kesie", label: "bigdripuniverse", type: "Album", trackCount: 16, year: 2024, blurb: "Sixteen tracks charting BigDripUniverse's biggest year yet.", tracks: [
      { title: "Gold Standard (Intro)", duration: "02:02" },
      { title: "Higher", duration: "03:33" },
      { title: "No Sleep", duration: "03:19" },
    ] },
  { id: "r9", title: "Bassline Prophet", artist: "Obi Waves", label: "elmayanaconcept", type: "EP", trackCount: 5, year: 2025, blurb: "Amapiano rhythm meets ambient electronic texture across five tracks.", tracks: [
      { title: "Bassline Prophet", duration: "04:41" },
      { title: "Low Orbit", duration: "05:02" },
    ] },
  { id: "r10", title: "Continental", artist: "Koje", label: "elmayanaconcept", type: "Single", trackCount: 1, year: 2025, blurb: "The record that soundtracked three continents this summer.", tracks: [{ title: "Continental", duration: "03:08" }] },
];

export const EVENTS: BaeEvent[] = [
  {
    id: "e1", name: "BAE Summer Wave", day: "28", month: "JUN", fullDate: "Saturday, June 28, 2025", time: "Doors open 7:00 PM",
    city: "Los Angeles, CA", venue: "The Novo", labels: ["bigdripuniverse", "ag20"], status: "upcoming",
    description: "A night of music, energy and culture as BAE brings together BigDripUniverse, AG20 and ElmayanaConcept for one unforgettable stage.",
    tiers: [
      { name: "Early Bird", price: 15000, fee: 1000, note: "Limited time offer" },
      { name: "General Admission", price: 25000, fee: 1500, note: "Access to all performances" },
      { name: "VIP", price: 50000, fee: 2000, note: "Priority entry, VIP lounge access" },
      { name: "VVIP", price: 100000, fee: 3000, note: "Meet & greet, exclusive merch, premium seating" },
    ],
  },
  {
    id: "e2", name: "AG20 Live in Lagos", day: "12", month: "JUL", fullDate: "Saturday, July 12, 2025", time: "Doors open 6:00 PM",
    city: "Lagos, Nigeria", venue: "Eko Convention Centre", labels: ["ag20", "elmayanaconcept"], status: "upcoming",
    description: "AG20's biggest headline show yet, with support from ElmayanaConcept's rising roster.",
    tiers: [
      { name: "General Admission", price: 20000, fee: 1500, note: "Standing floor access" },
      { name: "VIP", price: 45000, fee: 2000, note: "Reserved seating, welcome drink" },
      { name: "VVIP", price: 90000, fee: 3000, note: "Meet & greet and backstage tour" },
    ],
  },
  {
    id: "e3", name: "ElmayanaConcept Live", day: "26", month: "AUG", fullDate: "Wednesday, August 26, 2025", time: "Doors open 7:30 PM",
    city: "Houston, TX", venue: "Warehouse Live", labels: ["elmayanaconcept"], status: "upcoming",
    description: "An intimate showcase of ElmayanaConcept's full roster in one of Houston's most storied rooms.",
    tiers: [
      { name: "General Admission", price: 18000, fee: 1200, note: "Standing floor access" },
      { name: "VIP", price: 40000, fee: 1800, note: "Front-of-stage viewing" },
    ],
  },
  {
    id: "e4", name: "BAE World Tour — London", day: "07", month: "SEP", fullDate: "Sunday, September 7, 2025", time: "Doors open 6:30 PM",
    city: "London, UK", venue: "O2 Academy Brixton", labels: ["bigdripuniverse", "ag20", "elmayanaconcept"], status: "upcoming",
    description: "The full BAE roster crosses the Atlantic for the first stop of the BAE World Tour.",
    tiers: [
      { name: "General Admission", price: 22000, fee: 1500, note: "Standing floor access" },
      { name: "VIP", price: 55000, fee: 2200, note: "Balcony seating, welcome drink" },
      { name: "VVIP", price: 110000, fee: 3500, note: "Meet & greet, exclusive merch" },
    ],
  },
  {
    id: "e5", name: "BigDripUniverse Showcase", day: "18", month: "MAY", fullDate: "Sunday, May 18, 2025", time: "Doors open 8:00 PM",
    city: "Atlanta, GA", venue: "Center Stage", labels: ["bigdripuniverse"], status: "past",
    description: "A sold-out night introducing BigDripUniverse's newest signees to Atlanta.",
    tiers: [],
  },
  {
    id: "e6", name: "AG20 Album Listening", day: "03", month: "MAY", fullDate: "Saturday, May 3, 2025", time: "Doors open 9:00 PM",
    city: "New York, NY", venue: "SOB's", labels: ["ag20"], status: "past",
    description: "First listen of 'Bloomfield' with Deshawn Cole and the AG20 family.",
    tiers: [],
  },
  {
    id: "e7", name: "ElmayanaConcept Sessions", day: "20", month: "APR", fullDate: "Sunday, April 20, 2025", time: "Doors open 7:00 PM",
    city: "Toronto, Canada", venue: "The Drake Hotel", labels: ["elmayanaconcept"], status: "past",
    description: "A stripped-back live session series streamed to fans worldwide.",
    tiers: [],
  },
  {
    id: "e8", name: "BAE Experience Miami", day: "05", month: "APR", fullDate: "Sunday, April 5, 2025", time: "Doors open 8:00 PM",
    city: "Miami, FL", venue: "Rolling Loud Miami", labels: ["bigdripuniverse", "ag20", "elmayanaconcept"], status: "past",
    description: "BAE's takeover stage at Rolling Loud Miami, three labels back to back.",
    tiers: [],
  },
];

export const NEWS: NewsPost[] = [
  { id: "n1", category: "Announcement", title: "BAE Announces Bold New Chapter for the Culture", excerpt: "We're taking the movement global. New sounds, new partnerships and new experiences — this is just the beginning.", date: "May 21, 2025", readTime: "4 min read" },
  { id: "n2", category: "Music", title: "AG20 Drops Highly Anticipated Single \"No Turning Back\"", excerpt: "Ricochet returns with a powerful new record that speaks on growth, resilience and the journey forward.", date: "May 20, 2025", readTime: "3 min read" },
  { id: "n3", category: "Events", title: "ElmayanaConcept Live in Lagos — Tickets Out Now", excerpt: "Get ready, Lagos. ElmayanaConcept is bringing an unforgettable live experience this July.", date: "May 19, 2025", readTime: "2 min read" },
  { id: "n4", category: "Culture", title: "The BAE Fit: Style, Sound & Identity", excerpt: "Exploring how fashion, music and art come together to shape the BAE aesthetic.", date: "May 17, 2025", readTime: "5 min read" },
  { id: "n5", category: "Announcement", title: "BigDripUniverse Expands Creative Team", excerpt: "We're growing. Meet the new talent joining the BigDripUniverse family behind the scenes.", date: "May 17, 2025", readTime: "3 min read" },
  { id: "n6", category: "Industry", title: "The Rise of Independent Labels in Africa", excerpt: "A look at how independent labels are changing the game and taking control of the culture.", date: "May 13, 2025", readTime: "6 min read" },
];

export const CULTURE_STORIES: CultureStory[] = [
  { id: "c1", tag: "Story", title: "The BAE Philosophy: Three Labels. One Purpose.", excerpt: "A deep dive into the mindset and vision behind the movement.", date: "May 20, 2025", readTime: "5 min read" },
  { id: "c2", tag: "Fashion", title: "Style Is Sound: The BAE Aesthetic", excerpt: "How fashion and music come together to create a culture that speaks.", date: "May 15, 2025", readTime: "4 min read" },
  { id: "c3", tag: "Community", title: "Meet The People Behind The Movement", excerpt: "The creatives, dreamers and doers building BAE every day.", date: "May 10, 2025", readTime: "6 min read" },
  { id: "c4", tag: "Lifestyle", title: "The Little Things That Make Us BAE", excerpt: "From studio sessions to late nights, this is the lifestyle.", date: "May 5, 2025", readTime: "4 min read" },
];

export const VENUES = [
  { name: "The Novo", city: "Los Angeles, CA" },
  { name: "Eko Convention Centre", city: "Lagos, Nigeria" },
  { name: "Warehouse Live", city: "Houston, TX" },
  { name: "O2 Academy Brixton", city: "London, UK" },
  { name: "Center Stage", city: "Atlanta, GA" },
  { name: "SOB's", city: "New York, NY" },
];

export function getLabel(slug: string) {
  return LABELS.find((l) => l.slug === slug);
}

export function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}
