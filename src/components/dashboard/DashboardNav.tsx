"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./DashboardNav.module.css";

interface DashboardNavProps {
    userName?: string | null;
}

export function DashboardNav({ userName }: DashboardNavProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { href: "/", icon: "🏠", label: "Home", external: true },
        { href: "/dashboard", icon: "📊", label: "Overview" },
        { href: "/dashboard/events", icon: "📸", label: "Events" },
        { href: "/dashboard/emails", icon: "✉️", label: "Emails" },
        { href: "/dashboard/contacts", icon: "💬", label: "Contacts" },
        { href: "/dashboard/settings", icon: "⚙️", label: "Settings" },
    ];

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Desktop Sidebar */}
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
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navLink} ${isActive(item.href) ? styles.active : ""}`}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    {userName && <p className={styles.userInfo}>{userName}</p>}
                    <form action="/api/auth/signout" method="POST">
                        <button type="submit" className={styles.logoutBtn}>
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className={styles.mobileHeader}>
                <Link href="/" className={styles.mobileLogo}>
                    <span className={styles.logoAccent}>AL</span>
                    <span className={styles.logoDot}></span>
                    <span>AQMAR</span>
                </Link>
                <button
                    className={styles.menuBtn}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? "✕" : "☰"}
                </button>
            </header>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className={styles.mobileMenu}>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.mobileNavLink} ${isActive(item.href) ? styles.active : ""}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}

            {/* Mobile Bottom Nav - skip Home, show dashboard items */}
            <nav className={styles.bottomNav}>
                {navItems.filter(item => item.href !== "/").slice(0, 5).map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.bottomNavLink} ${isActive(item.href) ? styles.active : ""}`}
                    >
                        <span className={styles.bottomNavIcon}>{item.icon}</span>
                        <span className={styles.bottomNavLabel}>{item.label}</span>
                    </Link>
                ))}
            </nav>
        </>
    );
}
