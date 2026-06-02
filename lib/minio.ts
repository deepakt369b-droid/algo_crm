import { S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.MINIO_ENDPOINT || "http://localhost:9000";
const accessKeyId = process.env.MINIO_ACCESS_KEY || "minioadmin";
const secretAccessKey = process.env.MINIO_SECRET_KEY || "minioadmin";

export const minioClient = new S3Client({
  endpoint,
  region: "us-east-1", // MinIO requires a region value; actual value doesn't matter
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true, // REQUIRED for MinIO — without this, SDK uses virtual-hosted-style which breaks
});

export const MINIO_BUCKET = process.env.MINIO_BUCKET || "crm-bucket";
export const MINIO_PUBLIC_URL = process.env.NEXT_PUBLIC_MINIO_ENDPOINT || "http://localhost:9000";
