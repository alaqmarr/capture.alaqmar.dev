import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SetupForm } from "./SetupForm";

export const preferredRegion = "sin1";

export default async function SetupPage() {
    // Check if any user exists
    const userCount = await db.user.count();

    if (userCount > 0) {
        // User already exists, show error
        return (
            <div className="setup-page">
                <div className="setup-container error">
                    <h1>Setup Unavailable</h1>
                    <p>An admin account has already been created.</p>
                    <p>If you need to access the portfolio management, please use the login page.</p>
                    <a href="/login" className="setup-link">Go to Login</a>
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
                        max-width: 400px;
                        padding: 2rem;
                        background-color: var(--color-surface);
                        border: 1px solid var(--color-border);
                        border-radius: 1rem;
                        text-align: center;
                    }
                    .setup-container.error {
                        border-color: #ef4444;
                    }
                    .setup-container h1 {
                        color: #ef4444;
                        margin-bottom: 1rem;
                    }
                    .setup-container p {
                        color: var(--color-text-muted);
                        margin-bottom: 0.5rem;
                    }
                    .setup-link {
                        display: inline-block;
                        margin-top: 1rem;
                        padding: 0.75rem 1.5rem;
                        background-color: var(--color-accent);
                        color: var(--color-bg);
                        text-decoration: none;
                        border-radius: 0.5rem;
                        font-weight: 600;
                    }
                `}</style>
            </div>
        );
    }

    // No user exists, show setup form
    return <SetupForm />;
}
