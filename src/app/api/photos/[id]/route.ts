import { db } from "@/lib/db";
import { logApiError, createErrorResponse } from "@/lib/error-logger";
import { deleteFromStorage, type StorageProviderType } from "@/lib/storage";
import { NextRequest } from "next/server";

export const preferredRegion = "sin1";
export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

// DELETE /api/photos/[id] - Delete single photo
export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const photo = await db.photo.findUnique({
      where: { id },
    });

    if (!photo) {
      return createErrorResponse("Photo not found", 404);
    }

    // Delete from storage provider
    try {
      await deleteFromStorage(
        photo.storageKey,
        photo.storageProvider as StorageProviderType,
      );
    } catch (storageError) {
      console.error(
        `Failed to delete from ${photo.storageProvider}:`,
        storageError,
      );
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    await db.photo.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    await logApiError(error, "/api/photos/[id]", "DELETE");
    return createErrorResponse("Failed to delete photo", 500);
  }
}
