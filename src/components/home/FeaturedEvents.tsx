import Link from "next/link";
import { EventCard } from "@/components/ui/EventCard";
import { ArrowRightIcon } from "@/components/icons";
import styles from "./FeaturedEvents.module.css";

interface Event {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    coverImage: string | null;
    eventDate: Date | null;
    _count: {
        photos: number;
    };
}

interface FeaturedEventsProps {
    events: Event[];
}

export function FeaturedEvents({ events }: FeaturedEventsProps) {
    if (events.length === 0) {
        return (
            <section className={styles.section}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <div>
                            <span className={styles.label}>Portfolio</span>
                            <h2 className={styles.title}>Featured Work</h2>
                        </div>
                    </div>

                    <div className={styles.emptyState}>
                        <p className={styles.emptyText}>
                            New work coming soon. Check back later for updates.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <span className={styles.label}>Portfolio</span>
                        <h2 className={styles.title}>Featured Work</h2>
                    </div>
                    <Link href="/gallery" className={styles.viewAllLink}>
                        <span>View All</span>
                        <ArrowRightIcon className={styles.linkIcon} />
                    </Link>
                </div>

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
                                coverImage={event.coverImage}
                                eventDate={event.eventDate}
                                photoCount={event._count.photos}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
