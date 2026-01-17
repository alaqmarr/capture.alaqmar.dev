/**
 * Unified Storage Interface
 * Supports AWS S3, Firebase Storage, Cloudinary, Cloudflare R2, and Local storage
 */
// Re-export provider implementations
export { S3StorageProvider } from "./s3-provider";
export { FirebaseStorageProvider } from "./firebase-provider";
export { CloudinaryStorageProvider } from "./cloudinary-provider";
export { R2StorageProvider } from "./r2-provider";

export type StorageProviderType =
  | "AWS_S3"
  | "FIREBASE"
  | "CLOUDINARY"
  | "CLOUDFLARE_R2";

export interface UploadResult {
  url: string;
  key: string;
  provider: StorageProviderType;
}

export interface PresignedUrlResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  provider: StorageProviderType;
}

export interface StorageProvider {
  generatePresignedUrl(
    filename: string,
    contentType: string,
  ): Promise<PresignedUrlResult>;
  deleteFile(key: string): Promise<void>;
}

// Factory to get the right provider
export function getStorageProvider(type: StorageProviderType): StorageProvider {
  switch (type) {
    case "AWS_S3":
      return new (require("./s3-provider").S3StorageProvider)();
    case "FIREBASE":
      return new (require("./firebase-provider").FirebaseStorageProvider)();
    case "CLOUDINARY":
      return new (require("./cloudinary-provider").CloudinaryStorageProvider)();
    case "CLOUDFLARE_R2":
      return new (require("./r2-provider").R2StorageProvider)();
    default:
      throw new Error(`Unknown storage provider: ${type}`);
  }
}

// Delete file from any provider
export async function deleteFromStorage(
  key: string,
  provider: StorageProviderType,
): Promise<void> {
  const storageProvider = getStorageProvider(provider);
  await storageProvider.deleteFile(key);
}
