import {
    MailIcon,
    PhoneIcon,
    MapPinIcon,
    InstagramIcon,
} from "@/components/icons";
import styles from "./ContactInfo.module.css";

export function ContactInfo() {
    const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@alaqmar.com";
    const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "+1 234 567 890";
    const location = process.env.NEXT_PUBLIC_CONTACT_LOCATION || "Your City, Country";
    const instagram = process.env.NEXT_PUBLIC_CONTACT_INSTAGRAM || "@alaqmar";

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Contact Details</h2>
            <p className={styles.description}>
                Feel free to reach out through any of these channels.
                I&apos;m always excited to discuss new projects and creative ideas.
            </p>

            <div className={styles.items}>
                <a href={`mailto:${email}`} className={styles.item}>
                    <div className={styles.iconWrapper}>
                        <MailIcon className={styles.icon} />
                    </div>
                    <div className={styles.itemContent}>
                        <span className={styles.itemLabel}>Email</span>
                        <span className={styles.itemValue}>{email}</span>
                    </div>
                </a>

                <a href={`tel:${phone.replace(/\s/g, "")}`} className={styles.item}>
                    <div className={styles.iconWrapper}>
                        <PhoneIcon className={styles.icon} />
                    </div>
                    <div className={styles.itemContent}>
                        <span className={styles.itemLabel}>Phone</span>
                        <span className={styles.itemValue}>{phone}</span>
                    </div>
                </a>

                <div className={styles.item}>
                    <div className={styles.iconWrapper}>
                        <MapPinIcon className={styles.icon} />
                    </div>
                    <div className={styles.itemContent}>
                        <span className={styles.itemLabel}>Location</span>
                        <span className={styles.itemValue}>{location}</span>
                    </div>
                </div>
            </div>

            <div className={styles.socials}>
                <h3 className={styles.socialsTitle}>Follow</h3>
                <a
                    href={`https://instagram.com/${instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialLink}
                >
                    <InstagramIcon className={styles.socialIcon} />
                    <span>{instagram}</span>
                </a>
            </div>
        </div>
    );
}
