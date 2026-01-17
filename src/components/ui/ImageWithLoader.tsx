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
    // Removed loading state to show browser's native progressive loading immediately

    return (
        <div className={`${styles.container} ${fill ? styles.fill : ""} ${className}`}>
            <img
                src={src}
                alt={alt}
                loading={priority ? "eager" : "lazy"}
                className={`${styles.image}`}
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
