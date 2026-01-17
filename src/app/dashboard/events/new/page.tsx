"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import styles from "./page.module.css";

export default function NewEventPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [googleDriveUrl, setGoogleDriveUrl] = useState("");
    const [isLive, setIsLive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim() || null,
                    googleDriveUrl: googleDriveUrl.trim() || null,
                    isLive,
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
        </div>
    );
}
