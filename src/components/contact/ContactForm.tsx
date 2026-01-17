"use client";

import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import styles from "./ContactForm.module.css";

interface FormState {
    name: string;
    email: string;
    phone: string;
    message: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    message?: string;
}

export function ContactForm() {
    const [form, setForm] = useState<FormState>({
        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{
        show: boolean;
        type: "success" | "error";
        message: string;
    }>({ show: false, type: "success", message: "" });

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!form.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!form.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!form.message.trim()) {
            newErrors.message = "Message is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                throw new Error("Failed to submit");
            }

            setToast({
                show: true,
                type: "success",
                message: "Message sent successfully! I'll get back to you soon.",
            });

            setForm({ name: "", email: "", phone: "", message: "" });
        } catch {
            setToast({
                show: true,
                type: "error",
                message: "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.row}>
                    <Input
                        label="Name"
                        placeholder="Your name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        error={errors.name}
                    />
                    <Input
                        label="Email"
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        error={errors.email}
                    />
                </div>

                <Input
                    label="Phone (Optional)"
                    type="tel"
                    placeholder="+1 234 567 890"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />

                <Textarea
                    label="Message"
                    placeholder="Tell me about your project or inquiry..."
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    error={errors.message}
                />

                <Button type="submit" loading={loading} size="lg">
                    Send Message
                </Button>
            </form>

            {toast.show && (
                <div className={styles.toastContainer}>
                    <Toast
                        type={toast.type}
                        message={toast.message}
                        onClose={() => setToast({ ...toast, show: false })}
                    />
                </div>
            )}
        </>
    );
}
