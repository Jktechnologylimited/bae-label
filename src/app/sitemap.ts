import type { MetadataRoute } from "next";

/**
 * Public, indexable routes. Admin, account, auth and ticket pages are
 * deliberately excluded (see robots.ts).
 */
const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/events", priority: 0.9, changeFrequency: "daily" },
  { path: "/tickets", priority: 0.9, changeFrequency: "daily" },
  { path: "/news", priority: 0.8, changeFrequency: "daily" },
  { path: "/releases", priority: 0.8, changeFrequency: "weekly" },
  { path: "/artists", priority: 0.8, changeFrequency: "weekly" },
  { path: "/media", priority: 0.6, changeFrequency: "weekly" },
  { path: "/culture", priority: 0.6, changeFrequency: "weekly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/faqs", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/+$/, "");
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: `${base}${route.path === "/" ? "" : route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
