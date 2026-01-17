"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Toast } from "@/components/ui/Toast";
import { ImageCropper } from "@/components/ui/ImageCropper";
import { PlusIcon, TrashIcon, EditIcon, ImageIcon, UploadIcon, XIcon } from "@/components/icons";
import styles from "./EventsTab.module.css";

interface Event {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    coverImage: string | null;
    thumbnail: string | null;
    thumbnailKey: string | null;
    eventDate: string | null;
    isPublished: boolean;
    isLive: boolean;
    storageProvider: string;
    _count?: { photos: number };
}

interface EventsTabProps {
    onStorageChange?: () => void;
}

const STORAGE_PROVIDERS = [
    { value: "AWS_S3", label: "AWS S3" },
    { value: "FIREBASE", label: "Firebase Storage" },
    { value: "CLOUDINARY", label: "Cloudinary" },
    { value: "CLOUDFLARE_R2", label: "Cloudflare R2" },
];

export function EventsTab({ onStorageChange }: EventsTabProps) {
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [toast, setToast] = useState<{
        show: boolean;
        type: "success" | "error";
        message: string;
    }>({ show: false, type: "success", message: "" });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch("/api/events");
            const data = await res.json();
            setEvents(data);
        } catch {
            showToast("error", "Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will delete all photos too.")) return;

        try {
            const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            setEvents(events.filter((e) => e.id !== id));
            showToast("success", "Event deleted");
        } catch {
            showToast("error", "Failed to delete event");
        }
    };

    const handleEndLive = async (event: Event) => {
        try {
            const res = await fetch(`/api/events/${event.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...event, isLive: false }),
            });
            if (!res.ok) throw new Error();
            fetchEvents();
            showToast("success", "Live coverage ended. Event moved to gallery.");
        } catch {
            showToast("error", "Failed to end live coverage");
        }
    };

    // Navigate to photo management page
    const handleManagePhotos = (eventId: string) => {
        router.push(`/manage_my_portfolio/event/${eventId}`);
    };

    if (loading) {
        return <div className={styles.loading}>Loading events...</div>;
    }

    const liveEvents = events.filter((e) => e.isLive);
    const regularEvents = events.filter((e) => !e.isLive);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.sectionTitle}>Events</h2>
                <Button
                    onClick={() => {
                        setEditingEvent(null);
                        setShowForm(true);
                    }}
                >
                    <PlusIcon className={styles.btnIcon} />
                    New Event
                </Button>
            </div>

            {showForm && (
                <EventForm
                    event={editingEvent}
                    existingEvents={events}
                    onSave={(event) => {
                        if (editingEvent) {
                            setEvents(events.map((e) => (e.id === event.id ? event : e)));
                        } else {
                            setEvents([event, ...events]);
                        }
                        setShowForm(false);
                        setEditingEvent(null);
                        showToast("success", editingEvent ? "Event updated" : "Event created");
                    }}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingEvent(null);
                    }}
                />
            )}

            {/* Live Events Section */}
            {liveEvents.length > 0 && (
                <div className={styles.liveSection}>
                    <h3 className={styles.subsectionTitle}>
                        <span className={styles.liveDot}></span>
                        Live Events
                    </h3>
                    <div className={styles.list}>
                        {liveEvents.map((event) => (
                            <div key={event.id} className={`${styles.eventCard} ${styles.liveCard}`}>
                                {event.thumbnail && (
                                    <div className={styles.eventThumbnail}>
                                        <img src={event.thumbnail} alt={event.title} />
                                    </div>
                                )}
                                <div className={styles.eventInfo}>
                                    <h3 className={styles.eventTitle}>{event.title}</h3>
                                    <p className={styles.eventMeta}>
                                        {event._count?.photos || 0} photos
                                        {event.eventDate &&
                                            ` • ${new Date(event.eventDate).toLocaleDateString()}`}
                                    </p>
                                </div>
                                <div className={styles.eventActions}>
                                    <button
                                        className={styles.iconBtn}
                                        onClick={() => handleManagePhotos(event.id)}
                                        title="Manage photos"
                                    >
                                        <ImageIcon />
                                    </button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleEndLive(event)}
                                    >
                                        End Live
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Regular Events */}
            {regularEvents.length === 0 && liveEvents.length === 0 ? (
                <div className={styles.empty}>
                    <p>No events yet. Create your first event!</p>
                </div>
            ) : (
                regularEvents.length > 0 && (
                    <div className={styles.list}>
                        {regularEvents.map((event) => (
                            <div key={event.id} className={styles.eventCard}>
                                {event.thumbnail && (
                                    <div className={styles.eventThumbnail}>
                                        <img src={event.thumbnail} alt={event.title} />
                                    </div>
                                )}
                                <div className={styles.eventInfo}>
                                    <h3 className={styles.eventTitle}>{event.title}</h3>
                                    <p className={styles.eventMeta}>
                                        {event._count?.photos || 0} photos
                                        {event.eventDate &&
                                            ` • ${new Date(event.eventDate).toLocaleDateString()}`}
                                        {!event.isPublished && " • Draft"}
                                    </p>
                                </div>
                                <div className={styles.eventActions}>
                                    <button
                                        className={styles.iconBtn}
                                        onClick={() => handleManagePhotos(event.id)}
                                        title="Manage photos"
                                    >
                                        <ImageIcon />
                                    </button>
                                    <button
                                        className={styles.iconBtn}
                                        onClick={() => {
                                            setEditingEvent(event);
                                            setShowForm(true);
                                        }}
                                        title="Edit"
                                    >
                                        <EditIcon />
                                    </button>
                                    <button
                                        className={`${styles.iconBtn} ${styles.danger}`}
                                        onClick={() => handleDelete(event.id)}
                                        title="Delete"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {toast.show && (
                <div className={styles.toastContainer}>
                    <Toast
                        type={toast.type}
                        message={toast.message}
                        onClose={() => setToast({ ...toast, show: false })}
                    />
                </div>
            )}
        </div>
    );
}

interface EventFormProps {
    event: Event | null;
    existingEvents: Event[];
    onSave: (event: Event) => void;
    onCancel: () => void;
}

// Generate slug from title
function generateSlug(title: string): string {
    return slugify(title, {
        lower: true,
        strict: true,
        trim: true,
    });
}

function EventForm({ event, existingEvents, onSave, onCancel }: EventFormProps) {
    const [form, setForm] = useState({
        title: event?.title || "",
        description: event?.description || "",
        eventDate: event?.eventDate?.split("T")[0] || "",
        isPublished: event?.isPublished ?? true,
        isLive: event?.isLive ?? false,
        storageProvider: event?.storageProvider || "AWS_S3",
    });
    const [slugPreview, setSlugPreview] = useState(event?.slug || "");

    // Update slug preview when title changes
    useEffect(() => {
        if (form.title) {
            setSlugPreview(generateSlug(form.title));
        } else {
            setSlugPreview("");
        }
    }, [form.title]);

    // Check for duplicate slug
    const isDuplicateSlug = slugPreview && existingEvents.some(
        (e) => e.slug === slugPreview && e.id !== event?.id
    );

    const [thumbnail, setThumbnail] = useState<{
        file: File | null;
        preview: string | null;
        uploading: boolean;
        url: string | null;
        key: string | null;
        cropperSrc: string | null;
    }>({
        file: null,
        preview: event?.thumbnail || null,
        uploading: false,
        url: event?.thumbnail || null,
        key: event?.thumbnailKey || null,
        cropperSrc: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file");
            return;
        }

        // Check minimum resolution
        const img = new Image();
        img.onload = () => {
            if (img.width < 800) {
                setError(`Image too small. Minimum 800px wide required. Current: ${img.width}px`);
                URL.revokeObjectURL(img.src);
                return;
            }

            const aspectRatio = img.width / img.height;
            const target16_9 = 16 / 9;

            // Check if image is already 16:9 (within 5% tolerance)
            if (Math.abs(aspectRatio - target16_9) <= target16_9 * 0.05 && img.width >= 1280) {
                // Already 16:9 and high res - use directly
                setError("");
                setThumbnail({
                    file,
                    preview: URL.createObjectURL(file),
                    uploading: false,
                    url: null,
                    key: null,
                    cropperSrc: null,
                });
            } else {
                // Need cropping - open cropper dialog
                setError("");
                setThumbnail((t) => ({
                    ...t,
                    cropperSrc: URL.createObjectURL(file),
                }));
            }
        };
        img.src = URL.createObjectURL(file);

        // Reset input so same file can be selected again
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
            url: null,
            key: null,
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
        if (thumbnail.preview && !thumbnail.url) {
            URL.revokeObjectURL(thumbnail.preview);
        }
        setThumbnail({
            file: null,
            preview: null,
            uploading: false,
            url: null,
            key: null,
            cropperSrc: null,
        });
    };

    const uploadThumbnail = async (): Promise<{ url: string; key: string } | null> => {
        if (!thumbnail.file) return thumbnail.url ? { url: thumbnail.url, key: thumbnail.key! } : null;

        setThumbnail((t) => ({ ...t, uploading: true }));

        try {
            // Get presigned URL (always use S3 for thumbnails)
            const presignRes = await fetch("/api/photos/presigned-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    files: [{ filename: `thumbnail-${thumbnail.file.name}`, contentType: thumbnail.file.type }],
                    storageProvider: "AWS_S3", // Always S3 for thumbnails
                }),
            });

            if (!presignRes.ok) throw new Error("Failed to get upload URL");

            const { urls } = await presignRes.json();
            const urlData = urls[0];

            // Upload to S3
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
            // Upload thumbnail first if new file selected
            let thumbnailData = null;
            if (thumbnail.file) {
                thumbnailData = await uploadThumbnail();
                if (!thumbnailData && thumbnail.file) {
                    setLoading(false);
                    return; // Upload failed
                }
            } else if (thumbnail.url) {
                thumbnailData = { url: thumbnail.url, key: thumbnail.key };
            }

            const url = event ? `/api/events/${event.id}` : "/api/events";
            const method = event ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
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
            onSave(savedEvent);
        } catch {
            setError("Failed to save event");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h3 className={styles.formTitle}>
                {event ? "Edit Event" : "Create New Event"}
            </h3>

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
            <div className={styles.thumbnailSection}>
                <label className={styles.thumbnailLabel}>
                    Event Thumbnail
                    <span className={styles.thumbnailHint}>16:9 landscape, min 1280px wide (stored on S3)</span>
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
                    className={styles.hiddenInput}
                />
            </div>

            <Input
                label="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Event name"
            />

            <Textarea
                label="Description (Optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description"
                rows={3}
            />

            <Input
                label="Event Date (Optional)"
                type="date"
                value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            />

            {/* Storage Provider Selection */}
            <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>Photo Storage Provider</label>
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
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" loading={loading || thumbnail.uploading}>
                    {event ? "Update" : "Create"}
                </Button>
            </div>
        </form>
    );
}
