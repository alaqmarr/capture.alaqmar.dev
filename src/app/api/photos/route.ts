import { db } from "@/lib/db";
import { logApiError, createErrorResponse } from "@/lib/error-logger";
import { NextRequest } from "next/server";

export const preferredRegion = "sin1";
export const dynamic = "force-dynamic";

// GET /api/photos - Get photos for an event
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return createErrorResponse("eventId is required", 400);
    }

    const photos = await db.photo.findMany({
      where: { eventId },
      orderBy: { order: "asc" },
    });

    return Response.json(photos);
  } catch (error) {
    await logApiError(error, "/api/photos", "GET");
    return createErrorResponse("Failed to fetch photos", 500);
  }
}

// POST /api/photos - Save photo records after upload
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, url, storageKey, storageProvider, title, width, height } =
      body;

    // Support both single photo and batch
    if (eventId && url && storageKey) {
      // Single photo upload
      const event = await db.event.findUnique({
        where: { id: eventId },
        select: { id: true, storageProvider: true },
      });

      if (!event) {
        return createErrorResponse("Event not found", 404);
      }

      // Get current max order
      const maxOrder = await db.photo.findFirst({
        where: { eventId },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const photo = await db.photo.create({
        data: {
          eventId,
          url,
          storageKey,
          storageProvider: storageProvider || event.storageProvider,
          title: title || null,
          width: width || null,
          height: height || null,
          order: (maxOrder?.order ?? -1) + 1,
        },
      });

      return Response.json(photo, { status: 201 });
    }

    // Batch upload (legacy support)
    const { photos } = body;
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return createErrorResponse(
        "Photos array or single photo data is required",
        400,
      );
    }

    // Validate each photo
    for (const photo of photos) {
      if (!photo.eventId || !photo.url || !photo.storageKey) {
        return createErrorResponse(
          "Each photo requires eventId, url, and storageKey",
          400,
        );
      }

      const eventExists = await db.event.findUnique({
        where: { id: photo.eventId },
        select: { id: true },
      });

      if (!eventExists) {
        return createErrorResponse(`Event not found: ${photo.eventId}`, 404);
      }
    }

    const firstEventId = photos[0].eventId;
    const maxOrder = await db.photo.findFirst({
      where: { eventId: firstEventId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const startOrder = (maxOrder?.order ?? -1) + 1;

    const event = await db.event.findUnique({
      where: { id: firstEventId },
      select: { storageProvider: true },
    });

    const createdPhotos = await db.photo.createMany({
      data: photos.map(
        (
          photo: {
            eventId: string;
            url: string;
            storageKey: string;
            storageProvider?: string;
            title?: string;
            width?: number;
            height?: number;
          },
          index: number,
        ) => ({
          eventId: photo.eventId,
          url: photo.url,
          storageKey: photo.storageKey,
          storageProvider:
            (photo.storageProvider as
              | "AWS_S3"
              | "FIREBASE"
              | "CLOUDINARY"
              | "CLOUDFLARE_R2") ||
            event?.storageProvider ||
            "AWS_S3",
          title: photo.title || null,
          width: photo.width || null,
          height: photo.height || null,
          order: startOrder + index,
        }),
      ),
    });

    return Response.json({ count: createdPhotos.count }, { status: 201 });
  } catch (error) {
    await logApiError(error, "/api/photos", "POST");
    return createErrorResponse("Failed to save photos", 500);
  }
}
