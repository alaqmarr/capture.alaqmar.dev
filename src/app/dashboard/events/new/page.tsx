"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ImageCropper } from "@/components/ui/ImageCropper";
import { UploadIcon, XIcon } from "@/components/icons";
import styles from "./page.module.css";

export default function NewEventPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [googleDriveUrl, setGoogleDriveUrl] = useState("");
    const [isLive, setIsLive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Thumbnail state
    const [thumbnail, setThumbnail] = useState<{
        file: File | null;
        preview: string | null;
        cropperSrc: string | null;
    }>({
        file: null,
        preview: null,
        cropperSrc: null,
    });
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) return;

        const img = new Image();
        img.onload = () => {
            if (img.width < 800) {
                setError(`Image too small. Minimum 800px wide required. Current: ${img.width}px`);
                URL.revokeObjectURL(img.src);
                return;
            }

            // Always open cropper so user can select the area to keep
            setThumbnail((t) => ({
                ...t,
                cropperSrc: URL.createObjectURL(file),
            }));
        };
        img.src = URL.createObjectURL(file);

        if (thumbnailInputRef.current) {
            thumbnailInputRef.current.value = "";
        }
    };

    const handleCropComplete = (croppedBlob: Blob) => {
        const croppedFile = new File([croppedBlob], "thumbnail.jpg", { type: "image/jpeg" });
        setThumbnail({
            file: croppedFile,
            preview: URL.createObjectURL(croppedBlob),
            cropperSrc: null,
        });
    };

    const handleCropCancel = () => {
        if (thumbnail.cropperSrc) {
            URL.revokeObjectURL(thumbnail.cropperSrc);
        }
        setThumbnail((t) => ({ ...t, cropperSrc: null }));
    };

    const removeThumbnail = () => {
        if (thumbnail.preview) {
            URL.revokeObjectURL(thumbnail.preview);
        }
        setThumbnail({ file: null, preview: null, cropperSrc: null });
    };

    const uploadThumbnail = async (): Promise<{ url: string; key: string } | null> => {
        if (!thumbnail.file) return null;

        try {
            const presignRes = await fetch("/api/photos/presigned-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    files: [{ filename: `thumbnail-${Date.now()}.jpg`, contentType: "image/jpeg" }],
                    storageProvider: "AWS_S3",
                }),
            });

            if (!presignRes.ok) throw new Error("Failed to get upload URL");

            const { urls } = await presignRes.json();
            const { uploadUrl, key, publicUrl } = urls[0];

            const uploadRes = await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": "image/jpeg" },
                body: thumbnail.file,
            });

            if (!uploadRes.ok) throw new Error("Upload failed");

            return { url: publicUrl, key };
        } catch (error) {
            console.error("Thumbnail upload error:", error);
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        setLoading(true);

        try {
            let thumbnailData = null;
            if (thumbnail.file) {
                thumbnailData = await uploadThumbnail();
            }

            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim() || null,
                    googleDriveUrl: googleDriveUrl.trim() || null,
                    isLive,
                    ...(thumbnailData && {
                        thumbnail: thumbnailData.url,
                        thumbnailKey: thumbnailData.key,
                    }),
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Failed to create event");
                return;
            }

            const event = await res.json();
            router.push(`/dashboard/events/${event.id}`);
        } catch {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <a href="/dashboard/events" className={styles.backLink}>
                    ← Back to Events
                </a>
                <h1 className={styles.title}>Create New Event</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <p className={styles.error}>{error}</p>}

                {/* Thumbnail Section */}
                <div className={styles.field}>
                    <label className={styles.label}>Thumbnail (16:9)</label>
                    <div className={styles.thumbnailSection}>
                        {thumbnail.preview ? (
                            <div className={styles.thumbnailPreview}>
                                <img src={thumbnail.preview} alt="Thumbnail" />
                                <button
                                    type="button"
                                    className={styles.removeThumbnail}
                                    onClick={removeThumbnail}
                                >
                                    <XIcon />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className={styles.thumbnailUpload}
                                onClick={() => thumbnailInputRef.current?.click()}
                            >
                                <UploadIcon />
                                <span>Upload Thumbnail</span>
                            </button>
                        )}
                        <input
                            ref={thumbnailInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailSelect}
                            style={{ display: "none" }}
                        />
                    </div>
                    <p className={styles.hint}>Select the area you want to keep. Min 800px wide.</p>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Title *</label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Event title..."
                        required
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Description</label>
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe this event..."
                        rows={4}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Google Drive URL</label>
                    <Input
                        value={googleDriveUrl}
                        onChange={(e) => setGoogleDriveUrl(e.target.value)}
                        placeholder="https://drive.google.com/..."
                    />
                    <p className={styles.hint}>Optional: Link to full album on Google Drive</p>
                </div>

                <div className={styles.checkbox}>
                    <input
                        type="checkbox"
                        id="isLive"
                        checked={isLive}
                        onChange={(e) => setIsLive(e.target.checked)}
                    />
                    <label htmlFor="isLive">Start as Live Event</label>
                </div>

                <Button type="submit" loading={loading}>
                    Create Event
                </Button>
            </form>

            {/* Image Cropper Modal */}
            {thumbnail.cropperSrc && (
                <ImageCropper
                    imageSrc={thumbnail.cropperSrc}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}
        </div>
    );
}
