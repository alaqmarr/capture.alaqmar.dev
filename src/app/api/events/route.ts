import { db } from "@/lib/db";
import { logApiError, createErrorResponse } from "@/lib/error-logger";
import { NextRequest } from "next/server";

export const preferredRegion = "sin1";
export const dynamic = "force-dynamic";

// GET /api/events - List all events
export async function GET() {
  try {
    const events = await db.event.findMany({
      include: { _count: { select: { photos: true } } },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(events);
  } catch (error) {
    await logApiError(error, "/api/events", "GET");
    return createErrorResponse("Failed to fetch events", 500);
  }
}

// POST /api/events - Create new event
export async function POST(request: NextRequest) {
  try {
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

    if (!title) {
      return createErrorResponse("Title is required", 400);
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .concat("-", Date.now().toString(36));

    const event = await db.event.create({
      data: {
        title,
        description: description || null,
        slug,
        coverImage: coverImage || null,
        thumbnail: thumbnail || null,
        thumbnailKey: thumbnailKey || null,
        eventDate: eventDate ? new Date(eventDate) : null,
        isPublished: isPublished ?? true,
        isLive: isLive ?? false,
        liveStartedAt: isLive ? new Date() : null,
        storageProvider: storageProvider || "AWS_S3",
        googleDriveUrl: googleDriveUrl || null,
      },
    });

    return Response.json(event, { status: 201 });
  } catch (error) {
    await logApiError(error, "/api/events", "POST");
    return createErrorResponse("Failed to create event", 500);
  }
}
