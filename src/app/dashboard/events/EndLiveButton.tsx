"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface EndLiveButtonProps {
    eventId: string;
}

export function EndLiveButton({ eventId }: EndLiveButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleEndLive = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm("End live coverage for this event?")) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/events/${eventId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isLive: false }),
            });

            if (res.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error("Failed to end live:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className={styles.endLiveBtn}
            onClick={handleEndLive}
            disabled={loading}
        >
            {loading ? "..." : "End Live"}
        </button>
    );
}
