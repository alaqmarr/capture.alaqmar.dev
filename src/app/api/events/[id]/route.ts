import { db } from "@/lib/db";
import { logApiError, createErrorResponse } from "@/lib/error-logger";
import { deleteFromStorage, type StorageProviderType } from "@/lib/storage";
import { NextRequest } from "next/server";

export const preferredRegion = "sin1";
export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/events/[id] - Get single event
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const event = await db.event.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!event) {
      return createErrorResponse("Event not found", 404);
    }

    return Response.json(event);
  } catch (error) {
    await logApiError(error, "/api/events/[id]", "GET");
    return createErrorResponse("Failed to fetch event", 500);
  }
}

// PUT /api/events/[id] - Update event
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      eventDate,
      coverImage,
      thumbnail,
      thumbnailKey,
      isPublished,
      isLive,
      storageProvider,
      googleDriveUrl,
    } = body;

    // Get current event state to check live status change
    const currentEvent = await db.event.findUnique({
      where: { id },
      select: { isLive: true },
    });

    // Determine if we need to set liveStartedAt or liveEndedAt
    let liveStartedAt = undefined;
    let liveEndedAt = undefined;

    if (isLive && !currentEvent?.isLive) {
      // Starting live coverage
      liveStartedAt = new Date();
    } else if (!isLive && currentEvent?.isLive) {
      // Ending live coverage
      liveEndedAt = new Date();
    }

    const event = await db.event.update({
      where: { id },
      data: {
        title,
        description,
        coverImage,
        thumbnail,
        thumbnailKey,
        eventDate: eventDate ? new Date(eventDate) : null,
        isPublished,
        isLive,
        storageProvider,
        googleDriveUrl: googleDriveUrl || null,
        ...(liveStartedAt && { liveStartedAt }),
        ...(liveEndedAt && { liveEndedAt }),
      },
    });

    return Response.json(event);
  } catch (error) {
    await logApiError(error, "/api/events/[id]", "PUT");
    return createErrorResponse("Failed to update event", 500);
  }
}

// DELETE /api/events/[id] - Delete event and all photos
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Get photos to delete from storage
    const event = await db.event.findUnique({
      where: { id },
      include: { photos: true },
    });

    if (!event) {
      return createErrorResponse("Event not found", 404);
    }

    // Delete photos from storage providers
    for (const photo of event.photos) {
      try {
        await deleteFromStorage(
          photo.storageKey,
          photo.storageProvider as StorageProviderType,
        );
      } catch {
        // Continue even if storage deletion fails
        console.error(`Failed to delete from storage: ${photo.storageKey}`);
      }
    }

    // Delete event (cascade deletes photos from DB)
    await db.event.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    await logApiError(error, "/api/events/[id]", "DELETE");
    return createErrorResponse("Failed to delete event", 500);
  }
}
