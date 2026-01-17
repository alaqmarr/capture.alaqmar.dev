"use client";

import { useState, ImgHTMLAttributes } from "react";
import styles from "./ImageWithLoader.module.css";

interface ImageWithLoaderProps extends ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    fill?: boolean;
    priority?: boolean;
    quality?: number;
    placeholder?: string;
    blurDataURL?: string;
    className?: string;
}

export function ImageWithLoader({
    src,
    alt,
    fill = false,
    priority = false, // Map to loading="eager"
    quality, // Ignored for native img
    placeholder, // Ignored
    blurDataURL, // Ignored
    className = "",
    style,
    ...props
}: ImageWithLoaderProps) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className={`${styles.container} ${fill ? styles.fill : ""} ${className}`}>
            {isLoading && (
                <div className={styles.loaderContainer}>
                    <div className={styles.spinner}></div>
                </div>
            )}
            <img
                src={src}
                alt={alt}
                loading={priority ? "eager" : "lazy"}
                className={`${styles.image} ${isLoading ? styles.loading : styles.loaded}`}
                onLoad={() => setIsLoading(false)}
                style={{
                    position: fill ? "absolute" : "static",
                    width: fill ? "100%" : props.width,
                    height: fill ? "100%" : props.height,
                    objectFit: fill ? "cover" : undefined,
                    ...style
                }}
                {...props}
            />
        </div>
    );
}

export default ImageWithLoader;
