import Link from "next/link";
import { db } from "@/lib/db";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { AboutSection } from "@/components/home/AboutSection";
import { LiveBanner } from "@/components/home/LiveBanner";
import styles from "./page.module.css";

export const preferredRegion = "sin1";
export const dynamic = "force-dynamic";

async function getFeaturedEvents() {
  try {
    const events = await db.event.findMany({
      where: { isPublished: true },
      include: {
        _count: { select: { photos: true } },
        photos: {
          take: 1,
          orderBy: { order: "asc" }, // Get the first photo as fallback
          select: { url: true }
        }
      },
      orderBy: { createdAt: "asc" }, // Oldest events first
      take: 6,
    });

    // Map events to use the first photo if coverImage is missing
    return events.map(event => ({
      ...event,
      coverImage: event.coverImage || event.photos[0]?.url || null,
    }));
  } catch {
    return [];
  }
}

async function getLiveEventsCount() {
  try {
    const count = await db.event.count({
      where: { isLive: true, isPublished: true },
    });
    return count;
  } catch {
    return 0;
  }
}

export default async function HomePage() {
  const [events, liveCount] = await Promise.all([
    getFeaturedEvents(),
    getLiveEventsCount(),
  ]);

  return (
    <div className={styles.page}>
      {liveCount > 0 && <LiveBanner count={liveCount} />}
      <HeroSection />
      <AboutSection />
      <FeaturedEvents events={events} />
    </div>
  );
}
