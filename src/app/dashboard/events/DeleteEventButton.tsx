"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface DeleteEventButtonProps {
    eventId: string;
    eventTitle: string;
}

export function DeleteEventButton({ eventId, eventTitle }: DeleteEventButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm(`Delete "${eventTitle}"? This will delete all photos too.`)) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/events/${eventId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                router.refresh();
            } else {
                alert("Failed to delete event");
            }
        } catch (error) {
            console.error("Failed to delete:", error);
            alert("Failed to delete event");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            disabled={loading}
            title="Delete event"
        >
            {loading ? "..." : "🗑️"}
        </button>
    );
}
