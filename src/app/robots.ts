import type { MetadataRoute } from "next";

/**
 * Crawler rules. Everything customer-facing is open; the admin panel, the API,
 * account pages and anything ticket-bearing is not.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/account",
          "/verify",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/tickets/confirm",
          // Ticket codes are bearer credentials — never index them.
          "/ticket/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
