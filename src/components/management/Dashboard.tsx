"use client";

import { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import { EventsTab } from "./EventsTab";
import { MessagesTab } from "./MessagesTab";

type Tab = "events" | "messages";

interface StorageUsage {
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

export function ManagementDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>("events");
    const [storageUsage, setStorageUsage] = useState<StorageUsage[]>([]);
    const [loadingStorage, setLoadingStorage] = useState(true);

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
            setLoadingStorage(false);
        }
    };

    // Refresh storage after uploads
    const handleStorageRefresh = () => {
        fetchStorageUsage();
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Portfolio Management</h1>
                    <p className={styles.subtitle}>Manage your events, photos, and messages</p>
                </div>

                {/* Storage Indicator */}
                <div className={styles.storageSection}>
                    <h3 className={styles.storageSectionTitle}>Storage Usage</h3>
                    {loadingStorage ? (
                        <div className={styles.storageLoading}>Loading...</div>
                    ) : (
                        <div className={styles.storageGrid}>
                            {storageUsage.map((storage) => (
                                <div key={storage.provider} className={styles.storageCard}>
                                    <div className={styles.storageHeader}>
                                        <span className={styles.providerName}>
                                            {storage.provider.replace("_", " ")}
                                        </span>
                                        <span className={styles.storagePercent}>
                                            {storage.percentUsed}%
                                        </span>
                                    </div>
                                    <div className={styles.storageBar}>
                                        <div
                                            className={styles.storageBarFill}
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
                                    <div className={styles.storageStats}>
                                        <span>{storage.usedFormatted}</span>
                                        <span>{storage.remainingFormatted} free</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            <nav className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === "events" ? styles.active : ""}`}
                    onClick={() => setActiveTab("events")}
                >
                    Events & Photos
                </button>
                <button
                    className={`${styles.tab} ${activeTab === "messages" ? styles.active : ""}`}
                    onClick={() => setActiveTab("messages")}
                >
                    Messages
                </button>
            </nav>

            <main className={styles.content}>
                {activeTab === "events" && <EventsTab onStorageChange={handleStorageRefresh} />}
                {activeTab === "messages" && <MessagesTab />}
            </main>
        </div>
    );
}
