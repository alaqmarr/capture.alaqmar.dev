/**
 * Cloudflare R2 Storage Provider
 * Uses S3-compatible API with R2 credentials
 * Free Tier: 10 GB storage, 1 million Class A ops, 10 million Class B ops
 */
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageProvider, PresignedUrlResult } from "./index";

export class R2StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private publicDomain: string;

  constructor() {
    const endpoint = process.env.R2_ENDPOINT || "";
    this.bucket = process.env.R2_BUCKET || "";
    this.publicDomain = process.env.R2_PUBLIC_DOMAIN || "";

    this.client = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
      },
    });
  }

  async generatePresignedUrl(
    filename: string,
    contentType: string,
  ): Promise<PresignedUrlResult> {
    const key = `photos/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: 3600,
    });

    // Use public dev URL for serving
    const publicUrl = `${this.publicDomain}/${key}`;

    return {
      uploadUrl,
      publicUrl,
      key,
      provider: "CLOUDFLARE_R2",
    };
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
  }
}
