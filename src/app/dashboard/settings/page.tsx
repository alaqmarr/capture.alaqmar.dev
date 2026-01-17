import { auth } from "@/auth";
import styles from "./page.module.css";

export const preferredRegion = "sin1";

export default async function SettingsPage() {
    const session = await auth();

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Settings</h1>
                <p className={styles.subtitle}>Manage your account and preferences</p>
            </header>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Account Information</h2>
                <div className={styles.infoCard}>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Name</span>
                        <span className={styles.infoValue}>{session?.user?.name || "Not set"}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Email</span>
                        <span className={styles.infoValue}>{session?.user?.email}</span>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Quick Links</h2>
                <div className={styles.linksGrid}>
                    <a href="/" target="_blank" className={styles.linkCard}>
                        🌐 View Website
                    </a>
                    <a href="/gallery" target="_blank" className={styles.linkCard}>
                        📸 View Gallery
                    </a>
                    <a href="/setup" className={styles.linkCard}>
                        ⚙️ Initial Setup
                    </a>
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Environment</h2>
                <div className={styles.infoCard}>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Site URL</span>
                        <span className={styles.infoValue}>{process.env.NEXT_PUBLIC_SITE_URL || "Not configured"}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Email</span>
                        <span className={styles.infoValue}>{process.env.NEXT_PUBLIC_CONTACT_EMAIL || "Not configured"}</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
