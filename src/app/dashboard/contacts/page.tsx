import { db } from "@/lib/db";
import styles from "./page.module.css";

export const preferredRegion = "sin1";

export default async function ContactsPage() {
    const contacts = await db.contactSubmission.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Contacts</h1>
                <p className={styles.subtitle}>View and manage contact form submissions</p>
            </header>

            <div className={styles.contactsList}>
                {contacts.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No contact submissions yet.</p>
                    </div>
                ) : (
                    contacts.map((contact) => (
                        <div
                            key={contact.id}
                            className={`${styles.contactCard} ${!contact.isRead ? styles.unread : ""}`}
                        >
                            <div className={styles.contactHeader}>
                                <div>
                                    <h3 className={styles.contactName}>{contact.name}</h3>
                                    <p className={styles.contactEmail}>{contact.email}</p>
                                </div>
                                <span className={styles.date}>
                                    {new Date(contact.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            {contact.phone && (
                                <p className={styles.phone}>📞 {contact.phone}</p>
                            )}
                            <p className={styles.message}>{contact.message}</p>
                            <div className={styles.actions}>
                                <a
                                    href={`mailto:${contact.email}`}
                                    className={styles.replyBtn}
                                >
                                    Reply
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
