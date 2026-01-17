"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/gallery", label: "Gallery" },
    { href: "/live", label: "Live" },
    { href: "/contact", label: "Contact" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <header className={styles.header}>
            <nav className={styles.nav}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoMain}>AL</span>
                    <span className={styles.logoDot}></span>
                    <span className={styles.logoMain}>AQMAR</span>
                </Link>

                {/* Desktop Nav */}
                <ul className={styles.navLinks}>
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={`${styles.navLink} ${pathname === link.href ? styles.active : ""}`}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <MobileMenuButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
            </nav>

            {/* Mobile Menu Backdrop */}
            <div
                className={styles.mobileBackdrop}
                data-state={isOpen ? "open" : "closed"}
                onClick={() => setIsOpen(false)}
            />

            {/* Mobile Menu Sheet */}
            <div
                className={styles.mobileSheet}
                data-state={isOpen ? "open" : "closed"}
            >
                <ul className={styles.mobileNavLinks}>
                    {navLinks.map((link, index) => (
                        <li key={link.href} style={{ animationDelay: `${index * 100}ms` }}>
                            <Link
                                href={link.href}
                                className={`${styles.mobileNavLink} ${pathname === link.href ? styles.active : ""}`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </header>
    );
}

function MobileMenuButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
    return (
        <button
            className={styles.mobileMenuBtn}
            data-state={isOpen ? "open" : "closed"}
            onClick={onClick}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
        >
            <span className={styles.menuLine}></span>
            <span className={styles.menuLine}></span>
            <span className={styles.menuLine}></span>
        </button>
    );
}
