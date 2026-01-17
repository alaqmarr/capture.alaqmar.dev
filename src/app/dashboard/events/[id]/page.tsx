import { db } from "@/lib/db";
import { PhotoManager } from "@/components/management/PhotoManager";
import { notFound } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

export const preferredRegion = "sin1";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: Props) {
    const { id } = await params;

    const event = await db.event.findUnique({
        where: { id },
        include: {
            photos: {
                orderBy: { order: "asc" },
            },
        },
    });

    if (!event) {
        notFound();
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link href="/dashboard/events" className={styles.backLink}>
                    ← Back to Events
                </Link>
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.title}>{event.title}</h1>
                        <div className={styles.badges}>
                            {event.isLive && <span className={styles.liveBadge}>LIVE</span>}
                            <span className={event.isPublished ? styles.publishedBadge : styles.draftBadge}>
                                {event.isPublished ? "Published" : "Draft"}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <PhotoManager eventId={event.id} />
        </div>
    );
}
