export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Artists", href: "/artists" },
  { label: "Releases", href: "/releases" },
  { label: "Events", href: "/events" },
  { label: "Media", href: "/media" },
  { label: "BAE Culture", href: "/culture" },
  { label: "News", href: "/news" },
  { label: "About", href: "/about" },
];

export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com", icon: "instagram" },
  { label: "X", href: "https://x.com", icon: "x" },
  { label: "YouTube", href: "https://youtube.com", icon: "youtube" },
  { label: "TikTok", href: "https://tiktok.com", icon: "tiktok" },
  { label: "Spotify", href: "https://spotify.com", icon: "spotify" },
] as const;

export const FOOTER_COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Artists", href: "/artists" },
      { label: "Releases", href: "/releases" },
      { label: "Events", href: "/events" },
      { label: "Media", href: "/media" },
      { label: "BAE Culture", href: "/culture" },
      { label: "News", href: "/news" },
    ],
  },
  {
    title: "Our Labels",
    links: [
      { label: "BigDripUniverse", href: "/artists?label=bigdripuniverse" },
      { label: "AG20", href: "/artists?label=ag20" },
      { label: "ElmayanaConcept", href: "/artists?label=elmayanaconcept" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQs", href: "/faqs" },
      { label: "Contact Us", href: "/contact" },
      { label: "Ticket Help", href: "/faqs#tickets" },
      { label: "Submissions", href: "/contact#submissions" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  },
];
