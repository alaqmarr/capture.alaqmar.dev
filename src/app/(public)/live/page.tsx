import { Metadata } from "next";
import { db } from "@/lib/db";
import styles from "./page.module.css";
import Link from "next/link";
import { ImageWithLoader as Image } from "@/components/ui/ImageWithLoader";
import { ArrowRightIcon } from "@/components/icons";

export const preferredRegion = "sin1";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Live Coverage",
    description:
        "Watch live event coverage as it happens. Real-time photography from AL AQMAR.",
};

async function getLiveEvents() {
    try {
        const events = await db.event.findMany({
            where: { isLive: true, isPublished: true },
            include: {
                photos: {
                    orderBy: { createdAt: "desc" },
                    take: 6,
                },
                _count: { select: { photos: true } },
            },
            orderBy: { liveStartedAt: "desc" },
        });
        return events;
    } catch {
        return [];
    }
}

export default async function LivePage() {
    const liveEvents = await getLiveEvents();

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.liveBadge}>
                        <span className={styles.liveDot}></span>
                        <span>LIVE</span>
                    </div>
                    <h1 className={styles.title}>Live Coverage</h1>
                    <p className={styles.subtitle}>
                        Watch events unfold in real-time. New photos appear as they&apos;re captured.
                    </p>
                </div>
            </section>

            <section className={styles.content}>
                <div className={styles.container}>
                    {liveEvents.length > 0 ? (
                        <div className={styles.liveGrid}>
                            {liveEvents.map((event) => (
                                <LiveEventCard key={event.id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noLive}>
                            <h2 className={styles.noLiveTitle}>No Live Events</h2>
                            <p className={styles.noLiveText}>
                                There are no live events happening right now. Check back later or
                                browse the gallery.
                            </p>
                            <Link href="/gallery" className={styles.galleryLink}>
                                <span>Browse Gallery</span>
                                <ArrowRightIcon />
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

interface LiveEventCardProps {
    event: {
        id: string;
        title: string;
        slug: string;
        description: string | null;
        thumbnail: string | null;
        liveStartedAt: Date | null;
        photos: { id: string; url: string }[];
        _count: { photos: number };
    };
}

function LiveEventCard({ event }: LiveEventCardProps) {
    const startedAt = event.liveStartedAt
        ? new Date(event.liveStartedAt).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        })
        : null;

    // Use thumbnail or fallback to first photo
    const coverImage = event.thumbnail || event.photos[0]?.url;

    return (
        <Link href={`/live/${event.slug}`} className={styles.liveCard}>
            {/* Card Background with Thumbnail */}
            {coverImage && (
                <div className={styles.cardBg}>
                    <Image
                        src={coverImage}
                        alt={event.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className={styles.cardBgImage}
                    />
                    <div className={styles.cardGradient} />
                </div>
            )}

            <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                    <div className={styles.cardLiveBadge}>
                        <span className={styles.cardLiveDot}></span>
                        <span>LIVE</span>
                    </div>
                    {startedAt && (
                        <span className={styles.startedAt}>Started at {startedAt}</span>
                    )}
                </div>

                <h3 className={styles.cardTitle}>{event.title}</h3>
                {event.description && (
                    <p className={styles.cardDescription}>{event.description}</p>
                )}

                <div className={styles.cardFooter}>
                    <span className={styles.photoCount}>
                        {event._count.photos} photos captured
                    </span>
                    <span className={styles.viewLink}>
                        View Live
                        <ArrowRightIcon className={styles.viewIcon} />
                    </span>
                </div>
            </div>
        </Link>
    );
}
