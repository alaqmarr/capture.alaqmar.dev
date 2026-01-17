import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { CalendarIcon, ArrowLeftIcon, GoogleDriveIcon } from "@/components/icons";
import Link from "next/link";
import { ImageWithLoader as Image } from "@/components/ui/ImageWithLoader";
import styles from "./page.module.css";

export const preferredRegion = "sin1";
export const dynamic = "force-dynamic";

interface Props {
    params: Promise<{ slug: string }>;
}

async function getEvent(slug: string) {
    try {
        const event = await db.event.findUnique({
            where: { slug, isPublished: true },
            include: {
                photos: {
                    orderBy: { order: "asc" },
                },
            },
        });
        return event;
    } catch {
        return null;
    }
}

import { constructMetadata } from "@/lib/metadata";

// ... existing code ...

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const event = await getEvent(slug);

    if (!event) {
        return constructMetadata({
            title: "Event Not Found",
            noIndex: true
        });
    }

    return constructMetadata({
        title: event.title,
        description: event.description || `View photos from ${event.title} by AL AQMAR.`,
        image: event.thumbnail || event.coverImage || event.photos[0]?.url,
    });
}

export default async function EventPage({ params }: Props) {
    const { slug } = await params;
    const event = await getEvent(slug);

    if (!event) {
        notFound();
    }

    const formattedDate = event.eventDate
        ? new Date(event.eventDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : null;

    // Use thumbnail or fallback to coverImage or first photo
    const heroImage = event.thumbnail || event.coverImage || event.photos[0]?.url;

    return (
        <div className={styles.page}>
            {/* Hero Section with Thumbnail Background */}
            <section className={styles.hero}>
                {heroImage && (
                    <div className={styles.heroBg}>
                        <Image
                            src={heroImage}
                            alt={event.title}
                            fill
                            priority
                            className={styles.heroBgImage}
                        />
                        <div className={styles.heroOverlay} />
                    </div>
                )}

                <div className={styles.heroContent}>
                    <Link href="/gallery" className={styles.backLink}>
                        <ArrowLeftIcon className={styles.backIcon} />
                        <span>Back to Gallery</span>
                    </Link>

                    <h1 className={styles.title}>{event.title}</h1>

                    {event.description && (
                        <p className={styles.description}>{event.description}</p>
                    )}

                    <div className={styles.meta}>
                        {formattedDate && (
                            <span className={styles.metaItem}>
                                <CalendarIcon className={styles.metaIcon} />
                                {formattedDate}
                            </span>
                        )}
                        <span className={styles.metaItem}>
                            {event.photos.length} {event.photos.length === 1 ? "photo" : "photos"}
                        </span>
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
            </section>

            <section className={styles.photosSection}>
                <div className={styles.container}>
                    <PhotoGrid photos={event.photos} />
                </div>
            </section>
        </div>
    );
}
