"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ImageWithLoader as Image } from "@/components/ui/ImageWithLoader";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { ArrowLeftIcon, TrashIcon, UploadIcon, XIcon, CheckIcon, ImageIcon, EditIcon } from "@/components/icons";
import { EventEditor } from "./EventEditor";
import styles from "./PhotoManager.module.css";

interface Photo {
    id: string;
    url: string;
    storageKey: string;
    title: string | null;
    order: number;
    width: number | null;
    height: number | null;
    createdAt: string;
}

interface Event {
    id: string;
    title: string;
    slug: string;
    storageProvider: string;
    isLive: boolean;
    isPublished: boolean;
    thumbnail: string | null;
    description: string | null;
    googleDriveUrl: string | null;
    eventDate: string | null;
}

interface UploadItem {
    id: string;
    file: File;
    preview: string;
    progress: number;
    status: "pending" | "uploading" | "success" | "error";
    error?: string;
}

interface PhotoManagerProps {
    eventId: string;
}

export function PhotoManager({ eventId }: PhotoManagerProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [event, setEvent] = useState<Event | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploads, setUploads] = useState<UploadItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [toast, setToast] = useState<{
        show: boolean;
        type: "success" | "error";
        message: string;
    }>({ show: false, type: "success", message: "" });

    useEffect(() => {
        fetchData();
    }, [eventId]);

    const fetchData = async () => {
        try {
            const [eventRes, photosRes] = await Promise.all([
                fetch(`/api/events/${eventId}`),
                fetch(`/api/photos?eventId=${eventId}`),
            ]);

            if (eventRes.ok) setEvent(await eventRes.json());
            if (photosRes.ok) setPhotos(await photosRes.json());
        } catch {
            showToast("error", "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newUploads: UploadItem[] = files
            .filter((f) => f.type.startsWith("image/"))
            .map((file) => ({
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                file,
                preview: URL.createObjectURL(file),
                progress: 0,
                status: "pending",
            }));
        setUploads((prev) => [...prev, ...newUploads]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeUpload = (id: string) => {
        setUploads((prev) => {
            const item = prev.find((u) => u.id === id);
            if (item) URL.revokeObjectURL(item.preview);
            return prev.filter((u) => u.id !== id);
        });
    };

    const clearUploads = () => {
        uploads.forEach((u) => URL.revokeObjectURL(u.preview));
        setUploads([]);
    };

    const uploadAll = async () => {
        if (!event || uploads.length === 0) return;
        setIsUploading(true);

        // 1. Pre-calculate all metadata to ensure correct sorting order
        // regardless of which upload finishes first
        const pendingUploads = uploads.filter(u => u.status !== "success");
        if (pendingUploads.length === 0) {
            setIsUploading(false);
            return;
        }

        const safeTitle = event.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
        let startIndex = photos.length + 1;

        // Prepare queue with predetermined names
        const uploadQueue = pendingUploads.map((item, index) => {
            const ext = item.file.name.split(".").pop() || "jpg";
            const paddedIndex = (startIndex + index).toString().padStart(3, "0");

            return {
                ...item,
                targetFilename: `${safeTitle}-${paddedIndex}.${ext}`,
                targetTitle: `${event.title} - ${paddedIndex}`,
                dimensions: { width: 0, height: 0 } // placeholder
            };
        });

        // 2. Process in batches (Concurrency Limit: 3)
        // We use a small concurrency to avoid overwhelming the browser network stack
        const BATCH_SIZE = 3;

        for (let i = 0; i < uploadQueue.length; i += BATCH_SIZE) {
            const batch = uploadQueue.slice(i, i + BATCH_SIZE);

            await Promise.all(batch.map(async (task) => {
                try {
                    // Update status to uploading
                    setUploads(prev => prev.map(u => u.id === task.id ? { ...u, status: "uploading", progress: 10 } : u));

                    // A. Get Presigned URL
                    const presignRes = await fetch("/api/photos/presigned-url", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            files: [{ filename: task.targetFilename, contentType: task.file.type }],
                            storageProvider: event.storageProvider,
                        }),
                    });

                    if (!presignRes.ok) throw new Error("Failed to get upload URL");
                    const { urls } = await presignRes.json();

                    setUploads(prev => prev.map(u => u.id === task.id ? { ...u, progress: 40 } : u));

                    // B. Upload File to Storage
                    const uploadRes = await fetch(urls[0].uploadUrl, {
                        method: "PUT",
                        body: task.file,
                        headers: { "Content-Type": task.file.type },
                    });

                    if (!uploadRes.ok) throw new Error("Storage upload failed");

                    setUploads(prev => prev.map(u => u.id === task.id ? { ...u, progress: 80 } : u));

                    // C. Get Dimensions & Save to DB
                    const dims = await getImageDimensions(task.file);

                    const saveRes = await fetch("/api/photos", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            eventId: event.id,
                            url: urls[0].publicUrl,
                            storageKey: urls[0].key,
                            storageProvider: event.storageProvider,
                            title: task.targetTitle, // Pre-determined title ensures order
                            width: dims.width,
                            height: dims.height,
                        }),
                    });

                    if (!saveRes.ok) throw new Error("Database save failed");
                    const savedPhoto = await saveRes.json();

                    // D. Success
                    setPhotos(prev => [savedPhoto, ...prev]);
                    setUploads(prev => prev.map(u => u.id === task.id ? { ...u, status: "success", progress: 100 } : u));

                } catch (error) {
                    console.error("Upload error for", task.file.name, error);
                    setUploads(prev => prev.map(u => u.id === task.id ? { ...u, status: "error", error: "Failed" } : u));
                }
            }));
        }

        setIsUploading(false);
        showToast("success", "Batch upload complete");
    };

    const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
                URL.revokeObjectURL(img.src);
            };
            img.onerror = () => resolve({ width: 0, height: 0 });
            img.src = URL.createObjectURL(file);
        });
    };

    const deletePhoto = async (photo: Photo) => {
        if (!confirm("Delete this photo permanently? This will also remove it from storage.")) return;
        setDeletingId(photo.id);

        try {
            const res = await fetch(`/api/photos/${photo.id}`, { method: "DELETE" });
            if (res.ok) {
                setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
                showToast("success", "Photo deleted");
            } else {
                throw new Error();
            }
        } catch {
            showToast("error", "Delete failed");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingState}>
                    <div className={styles.spinner} />
                    <p>Loading event...</p>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className={styles.page}>
                <div className={styles.errorState}>
                    <h2>Event not found</h2>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        );
    }

    const pendingUploads = uploads.filter((u) => u.status !== "success");
    const completedCount = uploads.filter((u) => u.status === "success").length;

    return (
        <div className={styles.page}>
            {/* Hero Section */}
            <section className={styles.hero}>
                {event.thumbnail && (
                    <div className={styles.heroBg}>
                        <Image
                            src={event.thumbnail}
                            alt={event.title}
                            fill
                            priority
                            className={styles.heroBgImage}
                        />
                        <div className={styles.heroOverlay} />
                    </div>
                )}

                <div className={styles.heroContent}>
                    <button className={styles.backLink} onClick={() => router.back()}>
                        <ArrowLeftIcon className={styles.backIcon} />
                        <span>Back to Events</span>
                    </button>

                    <div className={styles.heroInfo}>
                        {event.isLive && (
                            <span className={styles.liveBadge}>
                                <span className={styles.liveDot} />
                                LIVE
                            </span>
                        )}
                        <h1 className={styles.heroTitle}>{event.title}</h1>
                        {event.description && (
                            <p className={styles.heroDescription}>{event.description}</p>
                        )}
                        <div className={styles.heroMeta}>
                            <span className={styles.metaItem}>
                                <ImageIcon className={styles.metaIcon} />
                                {photos.length} photos
                            </span>
                            <span className={styles.metaItem}>
                                Storage: {event.storageProvider.replace("_", " ")}
                            </span>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => setShowEditModal(true)}
                            className={styles.editBtn}
                        >
                            <EditIcon className={styles.editIcon} />
                            Edit Details
                        </Button>
                    </div>
                </div>
            </section>

            {showEditModal && (
                <EventEditor
                    event={event}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={(updated) => {
                        setEvent(updated as unknown as Event);
                        showToast("success", "Event updated successfully");
                    }}
                />
            )}

            {/* Upload Section */}
            <section className={styles.uploadSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Upload Photos</h2>
                        <p className={styles.sectionSubtitle}>
                            Add new photos to this event. Supports JPG, PNG, and WebP.
                        </p>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className={styles.hiddenInput}
                    />

                    {pendingUploads.length === 0 ? (
                        <div
                            className={styles.dropzone}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className={styles.dropzoneInner}>
                                <UploadIcon className={styles.dropzoneIcon} />
                                <span className={styles.dropzoneText}>Click to select photos</span>
                                <span className={styles.dropzoneHint}>or drag and drop</span>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.uploadQueue}>
                            <div className={styles.queueHeader}>
                                <div className={styles.queueInfo}>
                                    <span className={styles.queueCount}>{pendingUploads.length} files ready</span>
                                    {completedCount > 0 && (
                                        <span className={styles.completedCount}>
                                            <CheckIcon className={styles.checkIcon} />
                                            {completedCount} uploaded
                                        </span>
                                    )}
                                </div>
                                <div className={styles.queueActions}>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className={styles.addMoreBtn}
                                    >
                                        + Add More
                                    </button>
                                    <button onClick={clearUploads} className={styles.clearBtn}>
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            <div className={styles.queueGrid}>
                                {uploads.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`${styles.queueItem} ${styles[item.status]}`}
                                    >
                                        <img src={item.preview} alt="" className={styles.queueThumb} />
                                        <div className={styles.queueItemOverlay}>
                                            {item.status === "pending" && (
                                                <button
                                                    onClick={() => removeUpload(item.id)}
                                                    className={styles.removeBtn}
                                                >
                                                    <XIcon />
                                                </button>
                                            )}
                                            {item.status === "uploading" && (
                                                <div className={styles.progressIndicator}>
                                                    <span>{item.progress}%</span>
                                                </div>
                                            )}
                                            {item.status === "success" && (
                                                <div className={styles.successIndicator}>
                                                    <CheckIcon />
                                                </div>
                                            )}
                                            {item.status === "error" && (
                                                <div className={styles.errorIndicator}>!</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={uploadAll}
                                loading={isUploading}
                                className={styles.uploadBtn}
                            >
                                <UploadIcon />
                                Upload {pendingUploads.length} Photos
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* Photos Gallery Section */}
            <section className={styles.photosSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Event Photos</h2>
                        <p className={styles.sectionSubtitle}>
                            {photos.length > 0
                                ? `${photos.length} photos in this event. Hover to delete.`
                                : "No photos yet. Upload some above!"}
                        </p>
                    </div>

                    {photos.length > 0 ? (
                        <div className={styles.photoGrid}>
                            {photos.map((photo) => (
                                <div key={photo.id} className={styles.photoCard}>
                                    <div className={styles.photoImageWrapper}>
                                        <Image
                                            src={photo.url}
                                            alt={photo.title || ""}
                                            fill
                                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 200px"
                                            className={styles.photoImage}
                                        />
                                        <div className={styles.photoOverlay}>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => deletePhoto(photo)}
                                                disabled={deletingId === photo.id}
                                            >
                                                {deletingId === photo.id ? (
                                                    <span className={styles.deletingSpinner} />
                                                ) : (
                                                    <TrashIcon />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    {photo.title && (
                                        <p className={styles.photoTitle}>{photo.title}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <ImageIcon className={styles.emptyIcon} />
                            <p>No photos in this event yet</p>
                        </div>
                    )}
                </div>
            </section>

            {toast.show && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
        </div>
    );
}
