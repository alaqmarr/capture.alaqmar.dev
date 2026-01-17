import { db } from "@/lib/db";
import { logApiError, createErrorResponse } from "@/lib/error-logger";

export const preferredRegion = "sin1";
export const dynamic = "force-dynamic";

// Correct free tier limits in bytes (as of 2024)
const STORAGE_LIMITS = {
  AWS_S3: 5 * 1024 * 1024 * 1024, // 5 GB (Free tier for 12 months)
  FIREBASE: 1 * 1024 * 1024 * 1024, // 1 GB (Spark plan - no-cost)
  CLOUDINARY: 25 * 1024 * 1024 * 1024, // 25 GB (Free plan)
  CLOUDFLARE_R2: 10 * 1024 * 1024 * 1024, // 10 GB (Forever free)
};

// GET /api/storage/usage - Get storage usage for all providers
export async function GET() {
  try {
    // Get total size of photos grouped by storage provider
    const photos = await db.photo.findMany({
      select: {
        storageProvider: true,
        // We'll estimate size from width/height if available
        width: true,
        height: true,
      },
    });

    // Calculate estimated usage per provider
    // Average photo size estimate: 2MB for high-quality photos
    const DEFAULT_PHOTO_SIZE = 2 * 1024 * 1024; // 2 MB

    const usage: Record<
      string,
      { used: number; limit: number; count: number }
    > = {
      AWS_S3: { used: 0, limit: STORAGE_LIMITS.AWS_S3, count: 0 },
      FIREBASE: { used: 0, limit: STORAGE_LIMITS.FIREBASE, count: 0 },
      CLOUDINARY: { used: 0, limit: STORAGE_LIMITS.CLOUDINARY, count: 0 },
      CLOUDFLARE_R2: { used: 0, limit: STORAGE_LIMITS.CLOUDFLARE_R2, count: 0 },
    };

    for (const photo of photos) {
      const provider = photo.storageProvider;
      if (usage[provider]) {
        // Estimate size based on dimensions if available
        let estimatedSize = DEFAULT_PHOTO_SIZE;
        if (photo.width && photo.height) {
          // Rough estimate: 3 bytes per pixel (compressed JPEG)
          estimatedSize = Math.min(
            (photo.width * photo.height * 3) / 10, // JPEG compression ratio ~10:1
            DEFAULT_PHOTO_SIZE * 2, // Cap at 4MB
          );
        }
        usage[provider].used += estimatedSize;
        usage[provider].count += 1;
      }
    }

    // Format response with human-readable values
    const response = Object.entries(usage).map(([provider, data]) => ({
      provider,
      used: data.used,
      limit: data.limit,
      count: data.count,
      remaining: data.limit - data.used,
      percentUsed: Math.round((data.used / data.limit) * 100),
      usedFormatted: formatBytes(data.used),
      remainingFormatted: formatBytes(data.limit - data.used),
      limitFormatted: formatBytes(data.limit),
    }));

    return Response.json(response);
  } catch (error) {
    await logApiError(error, "/api/storage/usage", "GET");
    return createErrorResponse("Failed to fetch storage usage", 500);
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
