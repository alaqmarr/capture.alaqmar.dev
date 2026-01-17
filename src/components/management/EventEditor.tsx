"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageCropper } from "@/components/ui/ImageCropper";
import { GoogleDriveIcon, UploadIcon, XIcon } from "@/components/icons";
import styles from "./EventEditor.module.css";

interface Event {
    id: string;
    title: string;
    description: string | null;
    googleDriveUrl: string | null;
    isLive: boolean;
    isPublished: boolean;
    eventDate: string | null;
    thumbnail?: string | null;
    thumbnailKey?: string | null;
}

interface EventEditorProps {
    event: Event;
    onUpdate: (updatedEvent: Event) => void;
    onClose: () => void;
}

export function EventEditor({ event, onUpdate, onClose }: EventEditorProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: event.title,
        description: event.description || "",
        googleDriveUrl: event.googleDriveUrl || "",
        isLive: event.isLive,
        isPublished: event.isPublished,
        eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split("T")[0] : "",
    });

    // Thumbnail state
    const [thumbnail, setThumbnail] = useState<{
        file: File | null;
        preview: string | null;
        uploading: boolean;
        cropperSrc: string | null;
    }>({
        file: null,
        preview: event.thumbnail || null,
        uploading: false,
        cropperSrc: null,
    });
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) return;

        const img = new Image();
        img.onload = () => {
            if (img.width < 800) {
                alert(`Image too small. Minimum 800px wide required. Current: ${img.width}px`);
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
        if (thumbnail.preview && thumbnail.file) {
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
        if (!thumbnail.file) {
            return event.thumbnail ? { url: event.thumbnail, key: event.thumbnailKey || "" } : null;
        }

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
        setLoading(true);

        try {
            let thumbnailData = null;
            if (thumbnail.file) {
                setThumbnail((t) => ({ ...t, uploading: true }));
                thumbnailData = await uploadThumbnail();
            }

            const res = await fetch(`/api/events/${event.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    description: formData.description || null,
                    googleDriveUrl: formData.googleDriveUrl || null,
                    eventDate: formData.eventDate || null,
                    ...(thumbnailData && {
                        thumbnail: thumbnailData.url,
                        thumbnailKey: thumbnailData.key,
                    }),
                    ...(thumbnail.preview === null && !thumbnail.file && {
                        thumbnail: null,
                        thumbnailKey: null,
                    }),
                }),
            });

            if (!res.ok) throw new Error("Failed to update event");

            const updated = await res.json();
            onUpdate(updated);
            onClose();
        } catch {
            alert("Failed to update event");
        } finally {
            setLoading(false);
            setThumbnail((t) => ({ ...t, uploading: false }));
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Edit Event Details</h2>
                    <button onClick={onClose} className={styles.closeBtn}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Thumbnail Section */}
                    <div className={styles.field}>
                        <label>Thumbnail (16:9)</label>
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
                        <label>Event Title</label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Description</label>
                        <textarea
                            className={styles.textarea}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.labelWithIcon}>
                            <GoogleDriveIcon className={styles.icon} />
                            Google Drive Album URL
                        </label>
                        <Input
                            type="url"
                            placeholder="https://drive.google.com/..."
                            value={formData.googleDriveUrl}
                            onChange={(e) => setFormData({ ...formData, googleDriveUrl: e.target.value })}
                        />
                        <p className={styles.hint}>Link to the full photo collection on Google Drive</p>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label>Event Date</label>
                            <Input
                                type="date"
                                value={formData.eventDate}
                                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className={styles.toggles}>
                        <label className={styles.toggle}>
                            <input
                                type="checkbox"
                                checked={formData.isLive}
                                onChange={(e) => setFormData({ ...formData, isLive: e.target.checked })}
                            />
                            <span className={styles.toggleLabel}>
                                {formData.isLive ? "🔴 Event is LIVE" : "Event is Offline"}
                            </span>
                        </label>

                        <label className={styles.toggle}>
                            <input
                                type="checkbox"
                                checked={formData.isPublished}
                                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                            />
                            <span className={styles.toggleLabel}>Published</span>
                        </label>
                    </div>

                    <div className={styles.actions}>
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={loading || thumbnail.uploading}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>

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
