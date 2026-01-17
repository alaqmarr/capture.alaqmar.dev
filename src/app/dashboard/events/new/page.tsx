"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ImageCropper } from "@/components/ui/ImageCropper";
import { UploadIcon, XIcon } from "@/components/icons";
import styles from "./page.module.css";

const STORAGE_PROVIDERS = [
    { value: "AWS_S3", label: "AWS S3" },
    { value: "FIREBASE", label: "Firebase Storage" },
    { value: "CLOUDINARY", label: "Cloudinary" },
    { value: "CLOUDFLARE_R2", label: "Cloudflare R2" },
];

export default function NewEventPage() {
    const router = useRouter();
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        title: "",
        description: "",
        eventDate: "",
        isPublished: true,
        isLive: false,
        storageProvider: "AWS_S3",
    });

    const [thumbnail, setThumbnail] = useState<{
        file: File | null;
        preview: string | null;
        uploading: boolean;
        cropperSrc: string | null;
    }>({
        file: null,
        preview: null,
        uploading: false,
        cropperSrc: null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select an image file");
            return;
        }

        const img = new Image();
        img.onload = () => {
            if (img.width < 800) {
                setError(`Image too small. Minimum 800px wide required. Current: ${img.width}px`);
                URL.revokeObjectURL(img.src);
                return;
            }

            // Always open cropper so user can select area
            setError("");
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
            uploading: false,
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
        setThumbnail({
            file: null,
            preview: null,
            uploading: false,
            cropperSrc: null,
        });
    };

    const uploadThumbnail = async (): Promise<{ url: string; key: string } | null> => {
        if (!thumbnail.file) return null;

        setThumbnail((t) => ({ ...t, uploading: true }));

        try {
            const presignRes = await fetch("/api/photos/presigned-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    files: [{ filename: `thumbnail-${thumbnail.file.name}`, contentType: thumbnail.file.type }],
                    storageProvider: "AWS_S3",
                }),
            });

            if (!presignRes.ok) throw new Error("Failed to get upload URL");

            const { urls } = await presignRes.json();
            const urlData = urls[0];

            const uploadRes = await fetch(urlData.uploadUrl, {
                method: "PUT",
                body: thumbnail.file,
                headers: { "Content-Type": thumbnail.file.type },
            });

            if (!uploadRes.ok) throw new Error("Failed to upload thumbnail");

            return { url: urlData.publicUrl, key: urlData.key };
        } catch (err) {
            console.error("Thumbnail upload error:", err);
            setError("Failed to upload thumbnail");
            return null;
        } finally {
            setThumbnail((t) => ({ ...t, uploading: false }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) {
            setError("Title is required");
            return;
        }

        setLoading(true);
        setError("");

        try {
            let thumbnailData = null;
            if (thumbnail.file) {
                thumbnailData = await uploadThumbnail();
                if (!thumbnailData && thumbnail.file) {
                    setLoading(false);
                    return;
                }
            }

            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.title.trim(),
                    description: form.description.trim() || null,
                    eventDate: form.eventDate || null,
                    isPublished: form.isPublished,
                    isLive: form.isLive,
                    storageProvider: form.storageProvider,
                    thumbnail: thumbnailData?.url || null,
                    thumbnailKey: thumbnailData?.key || null,
                }),
            });

            if (!res.ok) throw new Error();

            const savedEvent = await res.json();
            router.push(`/dashboard/events/${savedEvent.id}`);
        } catch {
            setError("Failed to save event");
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

                {/* Image Cropper Dialog */}
                {thumbnail.cropperSrc && (
                    <ImageCropper
                        imageSrc={thumbnail.cropperSrc}
                        onCropComplete={handleCropComplete}
                        onCancel={handleCropCancel}
                        aspectRatio={16 / 9}
                        minWidth={1280}
                    />
                )}

                {/* Thumbnail Upload */}
                <div className={styles.field}>
                    <label className={styles.label}>
                        Event Thumbnail
                        <span className={styles.labelHint}>16:9 landscape, min 800px wide</span>
                    </label>

                    {thumbnail.preview ? (
                        <div className={styles.thumbnailPreview}>
                            <img src={thumbnail.preview} alt="Thumbnail preview" />
                            <button
                                type="button"
                                className={styles.thumbnailRemove}
                                onClick={removeThumbnail}
                            >
                                <XIcon />
                            </button>
                            {thumbnail.uploading && (
                                <div className={styles.thumbnailUploading}>Uploading...</div>
                            )}
                        </div>
                    ) : (
                        <div
                            className={styles.thumbnailDropzone}
                            onClick={() => thumbnailInputRef.current?.click()}
                        >
                            <UploadIcon className={styles.thumbnailIcon} />
                            <span>Click to upload thumbnail</span>
                            <span className={styles.thumbnailSize}>Recommended: 1920×1080</span>
                        </div>
                    )}
                    <input
                        ref={thumbnailInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailSelect}
                        style={{ display: "none" }}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Title *</label>
                    <Input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Event name"
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Description (Optional)</label>
                    <Textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Brief description"
                        rows={3}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Event Date (Optional)</label>
                    <Input
                        type="date"
                        value={form.eventDate}
                        onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    />
                </div>

                {/* Storage Provider Selection */}
                <div className={styles.field}>
                    <label className={styles.label}>Photo Storage Provider</label>
                    <div className={styles.radioOptions}>
                        {STORAGE_PROVIDERS.map((provider) => (
                            <label key={provider.value} className={styles.radioOption}>
                                <input
                                    type="radio"
                                    name="storageProvider"
                                    value={provider.value}
                                    checked={form.storageProvider === provider.value}
                                    onChange={(e) =>
                                        setForm({ ...form, storageProvider: e.target.value })
                                    }
                                />
                                <span>{provider.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className={styles.checkboxGroup}>
                    <label className={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={form.isPublished}
                            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                        />
                        <span>Published (visible on gallery)</span>
                    </label>

                    <label className={`${styles.checkbox} ${styles.liveCheckbox}`}>
                        <input
                            type="checkbox"
                            checked={form.isLive}
                            onChange={(e) => setForm({ ...form, isLive: e.target.checked })}
                        />
                        <span>🔴 Live Event (real-time coverage)</span>
                    </label>
                </div>

                <div className={styles.formActions}>
                    <Button type="button" variant="ghost" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={loading || thumbnail.uploading}>
                        Create Event
                    </Button>
                </div>
            </form>
        </div>
    );
}
