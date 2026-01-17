import type { StorageProvider, PresignedUrlResult } from "./index";

/**
 * Firebase Storage Provider
 *
 * Required env variables:
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_STORAGE_BUCKET
 * - FIREBASE_CLIENT_EMAIL (service account)
 * - FIREBASE_PRIVATE_KEY (service account)
 */

export class FirebaseStorageProvider implements StorageProvider {
  private bucket: string;
  private projectId: string;

  constructor() {
    this.bucket = process.env.FIREBASE_STORAGE_BUCKET || "";
    this.projectId = process.env.FIREBASE_PROJECT_ID || "";

    if (!this.bucket || !this.projectId) {
      console.warn(
        "Firebase Storage not configured. Set FIREBASE_STORAGE_BUCKET and FIREBASE_PROJECT_ID.",
      );
    }
  }

  async generatePresignedUrl(
    filename: string,
    contentType: string,
  ): Promise<PresignedUrlResult> {
    // Generate unique key
    const key = `photos/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    // For Firebase, we use a signed URL approach
    // In a real implementation, you'd use Firebase Admin SDK
    // This is a simplified version that generates a resumable upload URL

    const encodedKey = encodeURIComponent(key);

    // Firebase Storage REST API endpoint for resumable uploads
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${this.bucket}/o?uploadType=resumable&name=${encodedKey}`;

    // Public URL format for Firebase Storage
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${this.bucket}/o/${encodedKey}?alt=media`;

    // Note: In production, you should use Firebase Admin SDK to generate
    // properly signed URLs. This requires installing firebase-admin:
    // npm install firebase-admin
    //
    // const admin = require('firebase-admin');
    // const bucket = admin.storage().bucket();
    // const file = bucket.file(key);
    // const [url] = await file.getSignedUrl({
    //   action: 'write',
    //   expires: Date.now() + 3600 * 1000,
    //   contentType,
    // });

    return {
      uploadUrl,
      publicUrl,
      key,
      provider: "FIREBASE",
    };
  }

  async deleteFile(key: string): Promise<void> {
    // Firebase Storage REST API for deletion
    const encodedKey = encodeURIComponent(key);
    const deleteUrl = `https://firebasestorage.googleapis.com/v0/b/${this.bucket}/o/${encodedKey}`;

    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        // In production, add proper Firebase auth token
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      throw new Error(
        `Failed to delete file from Firebase: ${response.statusText}`,
      );
    }

    // Note: In production, use Firebase Admin SDK:
    // const admin = require('firebase-admin');
    // const bucket = admin.storage().bucket();
    // await bucket.file(key).delete();
  }
}
