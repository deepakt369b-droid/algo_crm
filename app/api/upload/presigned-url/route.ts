import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { minioClient, MINIO_BUCKET, MINIO_PUBLIC_URL } from "@/lib/minio";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { randomUUID } from "crypto";

const ALLOWED_FOLDERS = ["avatars", "images", "documents", "uploads"] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { filename: rawFilename, contentType, folder: rawFolder = "uploads" } = await req.json();

  // Sanitize: strip any path components to prevent path traversal
  const filename = path.basename(rawFilename ?? "");
  // Whitelist folder to only allow known upload destinations
  const folder: AllowedFolder = ALLOWED_FOLDERS.includes(rawFolder as AllowedFolder)
    ? (rawFolder as AllowedFolder)
    : "uploads";

  if (!filename || !contentType) {
    return NextResponse.json({ error: "filename and contentType are required" }, { status: 400 });
  }

  const ALLOWED_CONTENT_TYPES = new Set([
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ]);
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return NextResponse.json({ error: "Content type not allowed" }, { status: 400 });
  }

  // Fall back to "bin" if filename has no extension or extension is empty (e.g., ".")
  const ext = filename.includes(".") ? filename.split(".").pop()?.trim() || "bin" : "bin";
  const key = `${folder}/${randomUUID()}.${ext}`;

  try {
    const uploadRes = await supabaseAdmin.storage.from(MINIO_BUCKET).createSignedUploadUrl(key, 600);
    if (!uploadRes || (uploadRes as any).error) {
      console.error("Failed to create signed upload URL:", uploadRes);
      return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
    }

    const presignedUrl = (uploadRes as any).data?.signedUploadUrl || (uploadRes as any).data?.signedURL || (uploadRes as any).data?.url || (uploadRes as any).signedUploadUrl || (uploadRes as any).signedURL || (uploadRes as any).url;
    const pubRes = await supabaseAdmin.storage.from(MINIO_BUCKET).getPublicUrl(key);
    const fileUrl = (pubRes as any).data?.publicUrl || `${MINIO_PUBLIC_URL}/${MINIO_BUCKET}/${key}`;

    return NextResponse.json({ presignedUrl, fileUrl, key });
  } catch (err) {
    console.error("Failed to generate presigned URL:", err);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
