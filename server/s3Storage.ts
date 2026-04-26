/**
 * S3-compatible storage service for Koyeb (and any non-Replit) deployment.
 * Works with AWS S3, Cloudflare R2, Backblaze B2, DigitalOcean Spaces, etc.
 *
 * Required environment variables:
 *   S3_BUCKET_NAME        - bucket name
 *   S3_REGION             - region (e.g. "auto" for R2, "us-east-1" for AWS)
 *   S3_ACCESS_KEY_ID      - access key
 *   S3_SECRET_ACCESS_KEY  - secret key
 *   S3_ENDPOINT           - (optional) custom endpoint for non-AWS providers
 *                           e.g. https://<account-id>.r2.cloudflarestorage.com
 */

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

function buildClient(): S3Client {
  const config: ConstructorParameters<typeof S3Client>[0] = {
    region: process.env.S3_REGION || "auto",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
  };

  // Custom endpoint for R2, B2, Spaces, etc.
  if (process.env.S3_ENDPOINT) {
    config.endpoint = process.env.S3_ENDPOINT;
    // R2 / most non-AWS providers require path-style
    config.forcePathStyle = false;
  }

  return new S3Client(config);
}

const s3 = buildClient();
const BUCKET = process.env.S3_BUCKET_NAME || "";

export class S3StorageService {
  isConfigured(): boolean {
    return !!(
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY &&
      process.env.S3_BUCKET_NAME
    );
  }

  /**
   * Upload a buffer directly to S3 from the server (no presigned URL, no CORS).
   * Use this for server-side proxy uploads where the browser POSTs to Express
   * and Express forwards to S3.
   */
  async uploadBuffer(buffer: Buffer, contentType: string): Promise<string> {
    const key = `uploads/${randomUUID()}`;
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));
    return `/objects/${key}`;
  }

  /**
   * Generate a presigned PUT URL so the browser can upload a video directly
   * to S3. Returns both the signed upload URL and the normalized objectPath
   * that should be stored in the database.
   */
  async getVideoUploadURL(contentType?: string): Promise<{
    uploadURL: string;
    objectPath: string;
  }> {
    const key = `uploads/${randomUUID()}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
    });

    const uploadURL = await getSignedUrl(s3, command, {
      expiresIn: 900, // 15 minutes to complete upload
    });

    return {
      uploadURL,
      objectPath: `/objects/${key}`,
    };
  }

  /**
   * Generate a short-lived presigned GET URL for a stored object.
   * objectPath is the value stored in the DB e.g. "/objects/uploads/<uuid>"
   */
  async getPresignedGetURL(objectPath: string, expiresIn = 3600): Promise<string> {
    const key = objectPath.replace(/^\/objects\//, "");

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    return getSignedUrl(s3, command, { expiresIn });
  }

  /**
   * Check whether an object exists in S3.
   */
  async objectExists(objectPath: string): Promise<boolean> {
    const key = objectPath.replace(/^\/objects\//, "");
    try {
      await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
      return true;
    } catch {
      return false;
    }
  }
}

export const s3StorageService = new S3StorageService();
