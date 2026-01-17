"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, {
    type Crop,
    centerCrop,
    makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/Button";
import { XIcon } from "@/components/icons";
import styles from "./ImageCropper.module.css";

interface ImageCropperProps {
    imageSrc: string;
    onCropComplete: (croppedBlob: Blob) => void;
    onCancel: () => void;
    aspectRatio?: number;
    minWidth?: number;
}

export function ImageCropper({
    imageSrc,
    onCropComplete,
    onCancel,
    aspectRatio = 16 / 9,
    minWidth = 1280,
}: ImageCropperProps) {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<Crop>();
    const [loading, setLoading] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    // Initialize crop to center when image loads
    const onImageLoad = useCallback(
        (e: React.SyntheticEvent<HTMLImageElement>) => {
            const { naturalWidth: width, naturalHeight: height } = e.currentTarget;

            const initialCrop = centerCrop(
                makeAspectCrop(
                    {
                        unit: "%",
                        width: 90,
                    },
                    aspectRatio,
                    width,
                    height
                ),
                width,
                height
            );

            setCrop(initialCrop);
            setCompletedCrop(initialCrop);
        },
        [aspectRatio]
    );

    // Generate cropped image at high quality
    const handleCropConfirm = async () => {
        if (!completedCrop || !imgRef.current) return;

        setLoading(true);

        try {
            const image = imgRef.current;
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) throw new Error("No canvas context");

            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;

            // Calculate crop dimensions in natural image coordinates
            const pixelX = completedCrop.x * scaleX;
            const pixelY = completedCrop.y * scaleY;
            const pixelWidth = completedCrop.width * scaleX;
            const pixelHeight = completedCrop.height * scaleY;

            // Output dimensions - at least minWidth, maintain aspect ratio
            let outputWidth = Math.max(pixelWidth, minWidth);
            let outputHeight = outputWidth / aspectRatio;

            // If source is smaller than minWidth, use source dimensions
            if (pixelWidth < minWidth) {
                outputWidth = pixelWidth;
                outputHeight = pixelHeight;
            }

            // Set canvas size
            canvas.width = outputWidth;
            canvas.height = outputHeight;

            // Enable high quality image scaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            // Draw cropped image
            ctx.drawImage(
                image,
                pixelX,
                pixelY,
                pixelWidth,
                pixelHeight,
                0,
                0,
                outputWidth,
                outputHeight
            );

            // Convert to blob at high quality
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        onCropComplete(blob);
                    } else {
                        console.error("Failed to create blob");
                    }
                    setLoading(false);
                },
                "image/jpeg",
                0.92 // High quality JPEG
            );
        } catch (error) {
            console.error("Crop error:", error);
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Crop Thumbnail</h3>
                    <p className={styles.subtitle}>
                        Drag to adjust the 16:9 crop area. High quality output.
                    </p>
                    <button className={styles.closeBtn} onClick={onCancel}>
                        <XIcon />
                    </button>
                </div>

                <div className={styles.cropContainer}>
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={aspectRatio}
                        className={styles.cropper}
                    >
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            alt="Crop preview"
                            onLoad={onImageLoad}
                            className={styles.cropImage}
                        />
                    </ReactCrop>
                </div>

                <div className={styles.info}>
                    <span className={styles.infoItem}>📐 16:9 Aspect Ratio (Locked)</span>
                    <span className={styles.infoItem}>🖼️ High Quality Output</span>
                </div>

                <div className={styles.actions}>
                    <Button variant="ghost" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleCropConfirm} loading={loading}>
                        Apply Crop
                    </Button>
                </div>
            </div>
        </div>
    );
}
