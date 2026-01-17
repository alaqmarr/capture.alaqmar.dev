import { getStorageProvider, type StorageProviderType } from "@/lib/storage";
import { logApiError, createErrorResponse } from "@/lib/error-logger";
import { NextRequest } from "next/server";

export const preferredRegion = "sin1";
export const dynamic = "force-dynamic";

// POST /api/photos/presigned-url - Generate presigned URLs for uploads
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { files, storageProvider = "AWS_S3" } = body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return createErrorResponse("Files array is required", 400);
    }

    // Validate storage provider
    const validProviders: StorageProviderType[] = [
      "AWS_S3",
      "FIREBASE",
      "CLOUDINARY",
      "CLOUDFLARE_R2",
    ];
    if (!validProviders.includes(storageProvider)) {
      return createErrorResponse(
        `Invalid storage provider. Use: ${validProviders.join(", ")}`,
        400,
      );
    }

    // Validate files
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    for (const file of files) {
      if (!file.filename || !file.contentType) {
        return createErrorResponse(
          "Each file requires filename and contentType",
          400,
        );
      }

      if (!allowedTypes.includes(file.contentType)) {
        return createErrorResponse(
          `Invalid file type: ${file.contentType}. Allowed: ${allowedTypes.join(", ")}`,
          400,
        );
      }
    }

    // Get the appropriate storage provider
    const provider = getStorageProvider(storageProvider as StorageProviderType);

    // Generate presigned URLs for all files
    const results = await Promise.all(
      files.map(async (file: { filename: string; contentType: string }) => {
        const result = await provider.generatePresignedUrl(
          file.filename,
          file.contentType,
        );
        return {
          filename: file.filename,
          ...result,
        };
      }),
    );

    return Response.json({ urls: results, storageProvider });
  } catch (error) {
    await logApiError(error, "/api/photos/presigned-url", "POST");
    return createErrorResponse("Failed to generate presigned URLs", 500);
  }
}
