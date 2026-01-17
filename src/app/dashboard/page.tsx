import { db } from "@/lib/db";
import { StorageUsage } from "./StorageUsage";
import styles from "./page.module.css";

export const preferredRegion = "sin1";

export default async function DashboardPage() {
    const [eventCount, photoCount, contactCount, subscriberCount] = await Promise.all([
        db.event.count(),
        db.photo.count(),
        db.contactSubmission.count({ where: { isRead: false } }),
        db.subscriber.count({ where: { isActive: true } }).catch(() => 0),
    ]);

    const stats = [
        { label: "Total Events", value: eventCount, icon: "📸" },
        { label: "Total Photos", value: photoCount, icon: "🖼️" },
        { label: "Unread Messages", value: contactCount, icon: "💬" },
        { label: "Subscribers", value: subscriberCount, icon: "✉️" },
    ];

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Dashboard</h1>
                <p className={styles.subtitle}>Welcome back to your portfolio management</p>
            </header>

            <div className={styles.statsGrid}>
                {stats.map((stat) => (
                    <div key={stat.label} className={styles.statCard}>
                        <span className={styles.statIcon}>{stat.icon}</span>
                        <div className={styles.statContent}>
                            <p className={styles.statValue}>{stat.value}</p>
                            <p className={styles.statLabel}>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Storage Usage Section */}
            <StorageUsage />

            <section className={styles.quickActions}>
                <h2 className={styles.sectionTitle}>Quick Actions</h2>
                <div className={styles.actionsGrid}>
                    <a href="/dashboard/events/new" className={styles.actionCard}>
                        <span className={styles.actionIcon}>➕</span>
                        <span>Create Event</span>
                    </a>
                    <a href="/dashboard/emails" className={styles.actionCard}>
                        <span className={styles.actionIcon}>📧</span>
                        <span>Send Newsletter</span>
                    </a>
                    <a href="/dashboard/contacts" className={styles.actionCard}>
                        <span className={styles.actionIcon}>📬</span>
                        <span>View Messages</span>
                    </a>
                </div>
            </section>
        </div>
    );
}
