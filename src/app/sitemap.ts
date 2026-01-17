import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alaqmar.com";

  // Static routes
  const routes = ["", "/gallery", "/live", "/contact"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Fetch dynamic gallery events
  const galleryEvents = await db.event.findMany({
    where: { isPublished: true, isLive: false },
    select: { slug: true, updatedAt: true },
  });

  const galleryRoutes = galleryEvents.map((event) => ({
    url: `${baseUrl}/gallery/${event.slug}`,
    lastModified: event.updatedAt.toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Fetch dynamic live events
  const liveEvents = await db.event.findMany({
    where: { isPublished: true, isLive: true },
    select: { slug: true, updatedAt: true },
  });

  const liveRoutes = liveEvents.map((event) => ({
    url: `${baseUrl}/live/${event.slug}`,
    lastModified: event.updatedAt.toISOString(),
    changeFrequency: "always" as const,
    priority: 0.9,
  }));

  return [...routes, ...galleryRoutes, ...liveRoutes];
}
