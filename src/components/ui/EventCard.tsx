import Link from "next/link";
import Image from "next/image";
import styles from "./EventCard.module.css";
import { CalendarIcon, ImageIcon } from "@/components/icons";

interface EventCardProps {
    slug: string;
    title: string;
    description?: string | null;
    coverImage?: string | null;
    eventDate?: Date | null;
    photoCount?: number;
}

export function EventCard({
    slug,
    title,
    description,
    coverImage,
    eventDate,
    photoCount = 0,
}: EventCardProps) {
    const formattedDate = eventDate
        ? new Date(eventDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
        : null;

    return (
        <Link href={`/gallery/${slug}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                {coverImage ? (
                    <Image
                        src={coverImage}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className={styles.image}
                    />
                ) : (
                    <div className={styles.placeholder}>
                        <ImageIcon className={styles.placeholderIcon} />
                    </div>
                )}
                <div className={styles.overlay}>
                    <span className={styles.viewText}>View Gallery</span>
                </div>
            </div>

            <div className={styles.content}>
                <h3 className={styles.title}>{title}</h3>
                {description && <p className={styles.description}>{description}</p>}

                <div className={styles.meta}>
                    {formattedDate && (
                        <span className={styles.metaItem}>
                            <CalendarIcon className={styles.metaIcon} />
                            {formattedDate}
                        </span>
                    )}
                    <span className={styles.metaItem}>
                        <ImageIcon className={styles.metaIcon} />
                        {photoCount} photos
                    </span>
                </div>
            </div>
        </Link>
    );
}
