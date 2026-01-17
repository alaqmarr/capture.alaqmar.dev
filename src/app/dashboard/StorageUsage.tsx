"use client";

import { useState, useEffect } from "react";
import styles from "./StorageUsage.module.css";

interface StorageData {
    provider: string;
    used: number;
    limit: number;
    remaining: number;
    percentUsed: number;
    usedFormatted: string;
    remainingFormatted: string;
    limitFormatted: string;
    count: number;
}

const PROVIDER_LABELS: Record<string, string> = {
    AWS_S3: "AWS S3",
    FIREBASE: "Firebase",
    CLOUDINARY: "Cloudinary",
    CLOUDFLARE_R2: "Cloudflare R2",
};

export function StorageUsage() {
    const [storageUsage, setStorageUsage] = useState<StorageData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStorageUsage();
    }, []);

    const fetchStorageUsage = async () => {
        try {
            const res = await fetch("/api/storage/usage");
            if (res.ok) {
                const data = await res.json();
                setStorageUsage(data);
            }
        } catch (err) {
            console.error("Failed to fetch storage usage:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.section}>
                <h3 className={styles.title}>Storage Usage</h3>
                <p className={styles.loading}>Loading storage info...</p>
            </div>
        );
    }

    if (storageUsage.length === 0) {
        return null;
    }

    return (
        <div className={styles.section}>
            <h3 className={styles.title}>Storage Usage</h3>
            <div className={styles.grid}>
                {storageUsage.map((storage) => (
                    <div key={storage.provider} className={styles.card}>
                        <div className={styles.header}>
                            <span className={styles.providerName}>
                                {PROVIDER_LABELS[storage.provider] || storage.provider}
                            </span>
                            <span className={styles.photoCount}>{storage.count} photos</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{
                                    width: `${Math.min(storage.percentUsed, 100)}%`,
                                    backgroundColor:
                                        storage.percentUsed > 80
                                            ? "#ef4444"
                                            : storage.percentUsed > 50
                                                ? "#f59e0b"
                                                : "#22c55e",
                                }}
                            />
                        </div>
                        <div className={styles.stats}>
                            <span>{storage.usedFormatted} used</span>
                            <span>{storage.remainingFormatted} free</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
