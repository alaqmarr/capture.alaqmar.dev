import { Metadata } from "next";
import { ManagementDashboard } from "@/components/management/Dashboard";

export const preferredRegion = "sin1";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Manage Portfolio",
    robots: { index: false, follow: false },
};

export default function ManagePortfolioPage() {
    return <ManagementDashboard />;
}
