import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import styles from "./layout.module.css";
export const preferredRegion = "sin1";
export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <div className={styles.dashboard}>
            <DashboardNav userName={session.user?.name || session.user?.email} />
            <main className={styles.main}>{children}</main>
        </div>
    );
}
