import { db } from "@/lib/db";
import Link from "next/link";
import { EndLiveButton } from "./EndLiveButton";
import { DeleteEventButton } from "./DeleteEventButton";
import styles from "./page.module.css";

export const preferredRegion = "sin1";

const STORAGE_LABELS: Record<string, string> = {
    AWS_S3: "S3",
    FIREBASE: "Firebase",
    CLOUDINARY: "Cloudinary",
    CLOUDFLARE_R2: "R2",
};

export default async function EventsPage() {
    const events = await db.event.findMany({
        include: {
            _count: { select: { photos: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Events</h1>
                    <p className={styles.subtitle}>Manage your photography events</p>
                </div>
                <Link href="/dashboard/events/new" className={styles.createBtn}>
                    + Create Event
                </Link>
            </header>

            <div className={styles.eventsList}>
                {events.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No events yet. Create your first event to get started.</p>
                    </div>
                ) : (
                    events.map((event) => (
                        <div key={event.id} className={styles.eventCard}>
                            <Link
                                href={`/dashboard/events/${event.id}`}
                                className={styles.eventLink}
                            >
                                <div className={styles.eventInfo}>
                                    <h3 className={styles.eventTitle}>{event.title}</h3>
                                    <p className={styles.eventMeta}>
                                        {event._count.photos} photos
                                        <span className={styles.storageBadge}>
                                            {STORAGE_LABELS[event.storageProvider] || event.storageProvider}
                                        </span>
                                        {event.isLive && <span className={styles.liveBadge}>LIVE</span>}
                                        {!event.isPublished && <span className={styles.draftBadge}>Draft</span>}
                                    </p>
                                </div>
                                <span className={styles.arrow}>→</span>
                            </Link>
                            <div className={styles.eventActions}>
                                {event.isLive && (
                                    <EndLiveButton eventId={event.id} />
                                )}
                                <DeleteEventButton eventId={event.id} eventTitle={event.title} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

