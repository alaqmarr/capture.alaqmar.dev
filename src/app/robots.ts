import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alaqmar.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/manage_my_portfolio/",
        "/api/",
        "/_next/",
        "/admin/",
        "/private/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
