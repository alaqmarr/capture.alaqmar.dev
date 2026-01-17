"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import styles from "./page.module.css";

export default function NewsletterPage() {
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null);

    const handleSend = async () => {
        if (!subject.trim() || !content.trim()) {
            setResult({ success: false, message: "Subject and content are required" });
            return;
        }

        setSending(true);
        setResult(null);

        try {
            const res = await fetch("/api/newsletter/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject, content }),
            });

            const data = await res.json();

            if (res.ok) {
                setResult({ success: true, message: `Newsletter sent to ${data.sentCount} subscribers!` });
                setSubject("");
                setContent("");
            } else {
                setResult({ success: false, message: data.error || "Failed to send newsletter" });
            }
        } catch {
            setResult({ success: false, message: "Something went wrong" });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Newsletter</h1>
                <p className={styles.subtitle}>Compose and send newsletters to your subscribers</p>
            </header>

            <div className={styles.composer}>
                <div className={styles.field}>
                    <label className={styles.label}>Subject</label>
                    <Input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Newsletter subject line..."
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Content (HTML supported)</label>
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your newsletter content here..."
                        rows={12}
                    />
                </div>

                {result && (
                    <div className={`${styles.result} ${result.success ? styles.success : styles.error}`}>
                        {result.message}
                    </div>
                )}

                <Button onClick={handleSend} loading={sending}>
                    Send Newsletter
                </Button>
            </div>

            <section className={styles.subscribers}>
                <h2 className={styles.sectionTitle}>Subscriber Management</h2>
                <p className={styles.hint}>
                    Visitors can subscribe via a form on your website (coming soon),
                    or you can add subscribers manually via the API.
                </p>
            </section>
        </div>
    );
}
