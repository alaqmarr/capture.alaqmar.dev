import { db } from "@/lib/db";
import Link from "next/link";
import { EndLiveButton } from "./EndLiveButton";
import styles from "./page.module.css";

export const preferredRegion = "sin1";

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
                                        {event._count.photos} photos •
                                        {event.isLive && <span className={styles.liveBadge}>LIVE</span>}
                                        {event.isPublished ? " Published" : " Draft"}
                                    </p>
                                </div>
                                <span className={styles.arrow}>→</span>
                            </Link>
                            {event.isLive && (
                                <EndLiveButton eventId={event.id} />
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
