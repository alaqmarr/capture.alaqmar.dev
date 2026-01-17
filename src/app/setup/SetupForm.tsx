"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function SetupForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 4) {
            setError("Password must be at least 4 characters");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Setup failed");
                return;
            }

            // Redirect to login
            router.push("/login");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="setup-page">
            <div className="setup-container">
                <div className="setup-header">
                    <h1 className="setup-title">
                        <span className="accent">AL</span>
                        <span className="dot"></span>
                        <span>AQMAR</span>
                    </h1>
                    <p className="setup-subtitle">Initial Setup</p>
                    <p className="setup-hint">Create your admin account to manage your portfolio.</p>
                </div>

                <form onSubmit={handleSubmit} className="setup-form">
                    {error && <p className="error">{error}</p>}

                    <div className="field">
                        <label htmlFor="name">Name</label>
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            required
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="email">Email</label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            required
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="password">Password</label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <Button type="submit" loading={loading}>
                        Create Admin Account
                    </Button>
                </form>
            </div>

            <style>{`
                .setup-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: var(--color-bg);
                    padding: 1rem;
                }
                .setup-container {
                    width: 100%;
                    max-width: 400px;
                    padding: 2rem;
                    background-color: var(--color-surface);
                    border: 1px solid var(--color-border);
                    border-radius: 1rem;
                }
                .setup-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .setup-title {
                    font-size: 2rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .accent {
                    color: var(--color-accent);
                }
                .dot {
                    width: 6px;
                    height: 6px;
                    background-color: var(--color-accent);
                    border-radius: 50%;
                }
                .setup-subtitle {
                    color: var(--color-text-muted);
                    font-size: 0.875rem;
                    margin-top: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .setup-hint {
                    color: var(--color-text-secondary);
                    font-size: 0.875rem;
                    margin-top: 1rem;
                }
                .setup-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }
                .field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .field label {
                    font-size: 0.875rem;
                    color: var(--color-text-secondary);
                    font-weight: 500;
                }
                .error {
                    background-color: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    text-align: center;
                }
            `}</style>
        </div>
    );
}
