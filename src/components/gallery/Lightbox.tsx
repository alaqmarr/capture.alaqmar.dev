"use client";

import { useEffect, useCallback } from "react";
import { ImageWithLoader as Image } from "@/components/ui/ImageWithLoader";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "@/components/icons";
import styles from "./Lightbox.module.css";

interface Photo {
    id: string;
    url: string;
    title: string | null;
}

interface LightboxProps {
    photos: Photo[];
    currentIndex: number;
    onClose: () => void;
    onNavigate: (index: number) => void;
}

export function Lightbox({
    photos,
    currentIndex,
    onClose,
    onNavigate,
}: LightboxProps) {
    const currentPhoto = photos[currentIndex];

    const handlePrev = useCallback(() => {
        onNavigate(currentIndex > 0 ? currentIndex - 1 : photos.length - 1);
    }, [currentIndex, photos.length, onNavigate]);

    const handleNext = useCallback(() => {
        onNavigate(currentIndex < photos.length - 1 ? currentIndex + 1 : 0);
    }, [currentIndex, photos.length, onNavigate]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "ArrowRight") handleNext();
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [onClose, handlePrev, handleNext]);

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.content} onClick={(e) => e.stopPropagation()}>

                {/* Controls */}
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                    <XIcon />
                </button>

                <button
                    className={`${styles.navBtn} ${styles.prevBtn}`}
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    aria-label="Previous photo"
                >
                    <ChevronLeftIcon />
                </button>

                <button
                    className={`${styles.navBtn} ${styles.nextBtn}`}
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    aria-label="Next photo"
                >
                    <ChevronRightIcon />
                </button>

                {/* Image Container */}
                <div className={styles.imageContainer} onClick={onClose}>
                    <Image
                        src={currentPhoto.url}
                        alt={currentPhoto.title || "Photo"}
                        className={styles.image}
                        priority
                        // Removing fill prop to let CSS control natural sizing + containment
                        style={{ width: "auto", height: "auto", maxHeight: "100%", maxWidth: "100%" }}
                    />
                </div>

                <div className={styles.footer}>
                    {currentPhoto.title && (
                        <p className={styles.title}>{currentPhoto.title}</p>
                    )}
                    <p className={styles.counter}>
                        {currentIndex + 1} / {photos.length}
                    </p>
                </div>
            </div>
        </div>
    );
}
