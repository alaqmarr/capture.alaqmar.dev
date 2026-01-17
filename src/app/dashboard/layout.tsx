import { auth, signOut } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "./layout.module.css";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <div className={styles.dashboard}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoAccent}>AL</span>
                        <span className={styles.logoDot}></span>
                        <span>AQMAR</span>
                    </Link>
                    <p className={styles.sidebarSubtitle}>Dashboard</p>
                </div>

                <nav className={styles.nav}>
                    <Link href="/dashboard" className={styles.navLink}>
                        <span className={styles.navIcon}>📊</span>
                        Overview
                    </Link>
                    <Link href="/dashboard/events" className={styles.navLink}>
                        <span className={styles.navIcon}>📸</span>
                        Events
                    </Link>
                    <Link href="/dashboard/emails" className={styles.navLink}>
                        <span className={styles.navIcon}>✉️</span>
                        Newsletters
                    </Link>
                    <Link href="/dashboard/contacts" className={styles.navLink}>
                        <span className={styles.navIcon}>💬</span>
                        Contacts
                    </Link>
                    <Link href="/dashboard/settings" className={styles.navLink}>
                        <span className={styles.navIcon}>⚙️</span>
                        Settings
                    </Link>
                </nav>

                <div className={styles.sidebarFooter}>
                    <p className={styles.userInfo}>
                        {session.user?.name || session.user?.email}
                    </p>
                    <form
                        action={async () => {
                            "use server";
                            await signOut({ redirectTo: "/" });
                        }}
                    >
                        <button type="submit" className={styles.logoutBtn}>
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            <main className={styles.main}>{children}</main>
        </div>
    );
}
