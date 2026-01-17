import { Metadata } from "next";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { ArrowLeftIcon, GoogleDriveIcon } from "@/components/icons";
import styles from "./page.module.css";

export const preferredRegion = "sin1";
export const dynamic = "force-dynamic";

interface Params {
    params: Promise<{ slug: string }>;
}

async function getLiveEvent(slug: string) {
    try {
        const event = await db.event.findUnique({
            where: { slug },
            include: {
                photos: { orderBy: { createdAt: "desc" } },
                _count: { select: { photos: true } },
            },
        });
        return event;
    } catch {
        return null;
    }
}

import { constructMetadata } from "@/lib/metadata";

// ... existing code ...

export async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { slug } = await params;
    const event = await getLiveEvent(slug);

    if (!event) {
        return constructMetadata({
            title: "Event Not Found",
            noIndex: true
        });
    }

    return constructMetadata({
        title: `${event.isLive ? "🔴 LIVE: " : ""}${event.title}`,
        description: event.description || "Live event coverage by AL AQMAR Photography.",
        image: event.thumbnail || undefined,
    });
}

export default async function LiveEventPage({ params }: Params) {
    const { slug } = await params;
    const event = await getLiveEvent(slug);

    if (!event) {
        notFound();
    }

    const photos = event.photos.map((p) => ({
        id: p.id,
        url: p.url,
        title: p.title,
        width: p.width,
        height: p.height,
    }));

    return (
        <div className={styles.page}>
            {/* Hero Section with Thumbnail */}
            <section className={styles.hero}>
                {event.thumbnail && (
                    <div className={styles.heroBg}>
                        <Image
                            src={event.thumbnail}
                            alt={event.title}
                            fill
                            priority
                            className={styles.heroBgImage}
                        />
                        <div className={styles.heroOverlay} />
                    </div>
                )}

                <div className={styles.heroContent}>
                    <Link href="/live" className={styles.backLink}>
                        <ArrowLeftIcon />
                        <span>Back to Live Events</span>
                    </Link>

                    <div className={styles.eventHeader}>
                        {event.isLive && (
                            <div className={styles.liveBadge}>
                                <span className={styles.liveDot}></span>
                                <span>LIVE NOW</span>
                            </div>
                        )}
                        <h1 className={styles.title}>{event.title}</h1>
                        {event.description && (
                            <p className={styles.description}>{event.description}</p>
                        )}
                        <div className={styles.meta}>
                            <span className={styles.photoCount}>
                                {event._count.photos} photos
                            </span>
                            {event.liveStartedAt && (
                                <span className={styles.startTime}>
                                    Started{" "}
                                    {new Date(event.liveStartedAt).toLocaleString("en-IN", {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    })}
                                </span>
                            )}
                        </div>

                        {event.googleDriveUrl && (
                            <a
                                href={event.googleDriveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.driveButton}
                            >
                                <GoogleDriveIcon className={styles.driveIcon} />
                                <span>View Full Album on Drive</span>
                            </a>
                        )}
                    </div>
                </div>
            </section>

            {/* Photos Section */}
            <section className={styles.photosSection}>
                <div className={styles.container}>
                    {photos.length > 0 ? (
                        <>
                            {event.isLive && (
                                <p className={styles.liveNote}>
                                    📸 Photos appear here as they&apos;re captured. Refresh for the latest!
                                </p>
                            )}
                            <PhotoGrid photos={photos} />
                        </>
                    ) : (
                        <div className={styles.noPhotos}>
                            <p>No photos yet. Stay tuned!</p>
                        </div>
                    )}
                </div>
            </section >
        </div >
    );
}
