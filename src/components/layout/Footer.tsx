import { auth, signOut } from "@/auth";
import Link from "next/link";
import styles from "./Footer.module.css";
import { InstagramIcon, MailIcon, PhoneIcon, MapPinIcon } from "@/components/icons";

export async function Footer() {
    const session = await auth();
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {/* Brand Section */}
                    <div className={styles.brand}>
                        <Link href="/" className={styles.logo}>
                            <span className={styles.logoMain}>AL</span>
                            <span className={styles.logoDot}></span>
                            <span className={styles.logoMain}>AQMAR</span>
                        </Link>
                        <p className={styles.tagline}>
                            A passionate learner, capturing moments through the lens.
                            Every day is an opportunity to grow and create.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>Navigate</h4>
                        <ul className={styles.linkList}>
                            <li><Link href="/" className={styles.link}>Home</Link></li>
                            <li><Link href="/gallery" className={styles.link}>Gallery</Link></li>
                            <li><Link href="/contact" className={styles.link}>Contact</Link></li>
                            {session && (
                                <li><Link href="/manage_my_portfolio" className={styles.link}>Manage</Link></li>
                            )}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>Get in Touch</h4>
                        <ul className={styles.contactList}>
                            <li className={styles.contactItem}>
                                <MailIcon className={styles.contactIcon} />
                                <span>{process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@alaqmar.com"}</span>
                            </li>
                            <li className={styles.contactItem}>
                                <PhoneIcon className={styles.contactIcon} />
                                <span>{process.env.NEXT_PUBLIC_CONTACT_PHONE || "+1 234 567 890"}</span>
                            </li>
                            <li className={styles.contactItem}>
                                <MapPinIcon className={styles.contactIcon} />
                                <span>{process.env.NEXT_PUBLIC_CONTACT_LOCATION || "Your City, Country"}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Social Links */}
                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>Follow</h4>
                        <div className={styles.socialLinks}>
                            <a
                                href={`https://instagram.com/${(process.env.NEXT_PUBLIC_CONTACT_INSTAGRAM || "@alaqmar").replace("@", "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.socialLink}
                                aria-label="Instagram"
                            >
                                <InstagramIcon />
                            </a>
                        </div>
                        {session && (
                            <form
                                action={async () => {
                                    "use server";
                                    await signOut();
                                }}
                                className={styles.logoutForm}
                            >
                                <button type="submit" className={styles.logoutBtn}>
                                    Sign Out
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        © {currentYear} AL AQMAR. All rights reserved.
                    </p>
                    <p className={styles.madeWith}>
                        Crafted with passion & curiosity 📷
                    </p>
                </div>
            </div>
        </footer>
    );
}
