"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { GoogleDriveIcon } from "@/components/icons";
import styles from "./EventEditor.module.css";

interface Event {
    id: string;
    title: string;
    description: string | null;
    googleDriveUrl: string | null;
    isLive: boolean;
    isPublished: boolean;
    eventDate: string | null;
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/events/${event.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    description: formData.description || null,
                    googleDriveUrl: formData.googleDriveUrl || null,
                    eventDate: formData.eventDate || null,
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
                        <Button type="submit" loading={loading}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
