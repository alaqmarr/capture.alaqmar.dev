import { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactInfo } from "@/components/contact/ContactInfo";
import styles from "./page.module.css";

export const preferredRegion = "sin1";

export const metadata: Metadata = {
    title: "Contact",
    description:
        "Get in touch with AL AQMAR for photography inquiries, bookings, and collaborations.",
};

export default function ContactPage() {
    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <span className={styles.label}>Let&apos;s Connect</span>
                    <h1 className={styles.title}>Get in Touch</h1>
                    <p className={styles.subtitle}>
                        Have a project in mind or want to collaborate? I&apos;d love to hear from you.
                    </p>
                </div>
            </section>

            <section className={styles.content}>
                <div className={styles.container}>
                    <div className={styles.grid}>
                        <div className={styles.formSection}>
                            <h2 className={styles.sectionTitle}>Send a Message</h2>
                            <ContactForm />
                        </div>

                        <div className={styles.infoSection}>
                            <ContactInfo />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
