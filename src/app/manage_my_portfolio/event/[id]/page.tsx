import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PhotoManager } from "@/components/management/PhotoManager";

export const preferredRegion = "sin1";
export const dynamic = "force-dynamic";

interface Props {
    params: Promise<{ id: string }>;
}

async function getEvent(id: string) {
    try {
        const event = await db.event.findUnique({
            where: { id },
            include: { _count: { select: { photos: true } } },
        });
        return event;
    } catch {
        return null;
    }
}

import { constructMetadata } from "@/lib/metadata";

// ... existing code ...

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const event = await getEvent(id);

    if (!event) {
        return constructMetadata({
            title: "Event Not Found",
            noIndex: true
        });
    }

    return constructMetadata({
        title: `Manage: ${event.title}`,
        description: `Manage photos for ${event.title}`,
        noIndex: true, // Prevent indexing admin pages
    });
}

export default async function EventPhotosPage({ params }: Props) {
    const { id } = await params;
    const event = await getEvent(id);

    if (!event) {
        notFound();
    }

    return <PhotoManager eventId={id} />;
}
