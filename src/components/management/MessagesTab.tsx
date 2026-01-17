"use client";

import { useState, useEffect } from "react";
import { TrashIcon, CheckIcon } from "@/components/icons";
import { Toast } from "@/components/ui/Toast";
import styles from "./MessagesTab.module.css";

interface Message {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export function MessagesTab() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{
        show: boolean;
        type: "success" | "error";
        message: string;
    }>({ show: false, type: "success", message: "" });

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await fetch("/api/contact");
            const data = await res.json();
            setMessages(data);
        } catch {
            showToast("error", "Failed to load messages");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
    };

    const toggleRead = async (id: string, currentStatus: boolean) => {
        try {
            await fetch(`/api/contact/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isRead: !currentStatus }),
            });
            setMessages(
                messages.map((m) =>
                    m.id === id ? { ...m, isRead: !currentStatus } : m
                )
            );
        } catch {
            showToast("error", "Failed to update");
        }
    };

    const deleteMessage = async (id: string) => {
        if (!confirm("Delete this message?")) return;

        try {
            await fetch(`/api/contact/${id}`, { method: "DELETE" });
            setMessages(messages.filter((m) => m.id !== id));
            showToast("success", "Message deleted");
        } catch {
            showToast("error", "Failed to delete");
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading messages...</div>;
    }

    const unreadCount = messages.filter((m) => !m.isRead).length;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.sectionTitle}>
                    Messages
                    {unreadCount > 0 && (
                        <span className={styles.badge}>{unreadCount} new</span>
                    )}
                </h2>
            </div>

            {messages.length === 0 ? (
                <div className={styles.empty}>
                    <p>No messages yet.</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`${styles.messageCard} ${!msg.isRead ? styles.unread : ""}`}
                        >
                            <div className={styles.messageHeader}>
                                <div className={styles.senderInfo}>
                                    <span className={styles.senderName}>{msg.name}</span>
                                    <span className={styles.senderEmail}>{msg.email}</span>
                                    {msg.phone && (
                                        <span className={styles.senderPhone}>{msg.phone}</span>
                                    )}
                                </div>
                                <span className={styles.date}>
                                    {new Date(msg.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <p className={styles.messageContent}>{msg.message}</p>

                            <div className={styles.messageActions}>
                                <button
                                    className={`${styles.actionBtn} ${msg.isRead ? styles.read : ""}`}
                                    onClick={() => toggleRead(msg.id, msg.isRead)}
                                    title={msg.isRead ? "Mark as unread" : "Mark as read"}
                                >
                                    <CheckIcon />
                                    {msg.isRead ? "Read" : "Mark Read"}
                                </button>
                                <button
                                    className={`${styles.actionBtn} ${styles.danger}`}
                                    onClick={() => deleteMessage(msg.id)}
                                >
                                    <TrashIcon />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {toast.show && (
                <div className={styles.toastContainer}>
                    <Toast
                        type={toast.type}
                        message={toast.message}
                        onClose={() => setToast({ ...toast, show: false })}
                    />
                </div>
            )}
        </div>
    );
}
