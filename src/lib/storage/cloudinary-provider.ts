import type { StorageProvider, PresignedUrlResult } from "./index";
import crypto from "crypto";

/**
 * Cloudinary Storage Provider
 *
 * Required env variables:
 * - CLOUDINARY_CLOUD_NAME
 * - CLOUDINARY_API_KEY
 * - CLOUDINARY_API_SECRET
 */

export class CloudinaryStorageProvider implements StorageProvider {
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
    this.apiKey = process.env.CLOUDINARY_API_KEY || "";
    this.apiSecret = process.env.CLOUDINARY_API_SECRET || "";

    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      console.warn(
        "Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.",
      );
    }
  }

  private generateSignature(params: Record<string, string>): string {
    // Sort parameters alphabetically
    const sortedKeys = Object.keys(params).sort();
    const signatureString = sortedKeys
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    // Create SHA-1 hash with API secret
    return crypto
      .createHash("sha1")
      .update(signatureString + this.apiSecret)
      .digest("hex");
  }

  async generatePresignedUrl(
    filename: string,
    contentType: string,
  ): Promise<PresignedUrlResult> {
    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = `photos/${Date.now()}-${filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-]/g, "_")}`;

    // Parameters for signature
    const params: Record<string, string> = {
      timestamp: timestamp.toString(),
      public_id: publicId,
      folder: "alaqmar-portfolio",
    };

    const signature = this.generateSignature(params);

    // Cloudinary upload URL
    const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

    // Build the public URL (Cloudinary transforms the image on the fly)
    const publicUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload/f_auto,q_auto/alaqmar-portfolio/${publicId}`;

    // Return data needed for client-side upload
    // Client will POST to uploadUrl with file + these params
    return {
      uploadUrl,
      publicUrl,
      key: JSON.stringify({
        public_id: publicId,
        timestamp,
        signature,
        api_key: this.apiKey,
        folder: "alaqmar-portfolio",
      }),
      provider: "CLOUDINARY",
    };
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const publicId = key.startsWith("{") ? JSON.parse(key).public_id : key;

      const timestamp = Math.floor(Date.now() / 1000);
      const params = {
        public_id: `alaqmar-portfolio/${publicId}`,
        timestamp: timestamp.toString(),
      };

      const signature = this.generateSignature(params);

      const formData = new FormData();
      formData.append("public_id", params.public_id);
      formData.append("timestamp", params.timestamp);
      formData.append("signature", signature);
      formData.append("api_key", this.apiKey);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete from Cloudinary: ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error("Cloudinary delete error:", error);
      throw error;
    }
  }
}
