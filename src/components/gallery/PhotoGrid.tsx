"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./PhotoGrid.module.css";
import { Lightbox } from "./Lightbox";

interface Photo {
    id: string;
    url: string;
    title: string | null;
}

interface PhotoGridProps {
    photos: Photo[];
}

export function PhotoGrid({ photos }: PhotoGridProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    if (photos.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>No photos in this gallery yet.</p>
            </div>
        );
    }

    return (
        <>
            <div className={styles.grid}>
                {photos.map((photo, index) => (
                    <button
                        key={photo.id}
                        className={styles.photoCard}
                        onClick={() => setSelectedIndex(index)}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <Image
                            src={photo.url}
                            alt={photo.title || "Photo"}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className={styles.image}
                        />
                        <div className={styles.overlay}>
                            <span className={styles.viewText}>View</span>
                        </div>
                    </button>
                ))}
            </div>

            {selectedIndex !== null && (
                <Lightbox
                    photos={photos}
                    currentIndex={selectedIndex}
                    onClose={() => setSelectedIndex(null)}
                    onNavigate={setSelectedIndex}
                />
            )}
        </>
    );
}
