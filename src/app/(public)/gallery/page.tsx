import { Metadata } from "next";
import { db } from "@/lib/db";
import { EventCard } from "@/components/ui/EventCard";
import styles from "./page.module.css";

export const preferredRegion = "sin1";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Gallery",
    description:
        "Explore the photography portfolio of AL AQMAR. Browse through event galleries and visual stories.",
};

async function getEvents() {
    try {
        const events = await db.event.findMany({
            where: { isPublished: true },
            include: { _count: { select: { photos: true } } },
            orderBy: { createdAt: "desc" },
        });
        return events;
    } catch {
        return [];
    }
}

export default async function GalleryPage() {
    const events = await getEvents();

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <span className={styles.label}>Portfolio</span>
                    <h1 className={styles.title}>Gallery</h1>
                    <p className={styles.subtitle}>
                        A collection of moments, stories, and memories captured through the lens.
                    </p>
                </div>
            </section>

            <section className={styles.gallery}>
                <div className={styles.container}>
                    {events.length > 0 ? (
                        <div className={styles.grid}>
                            {events.map((event, index) => (
                                <div
                                    key={event.id}
                                    className={styles.cardWrapper}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <EventCard
                                        slug={event.slug}
                                        title={event.title}
                                        description={event.description}
                                        coverImage={event.thumbnail || event.coverImage}
                                        eventDate={event.eventDate}
                                        photoCount={event._count.photos}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <h2 className={styles.emptyTitle}>No Events Yet</h2>
                            <p className={styles.emptyText}>
                                New work is coming soon. Check back later for updates.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
