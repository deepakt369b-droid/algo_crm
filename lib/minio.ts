// Supabase-backed storage shim. We keep the original exported names
// (`MINIO_BUCKET`, `MINIO_PUBLIC_URL`) to minimize changes elsewhere in the
// codebase while switching the implementation to Supabase Storage.
import { supabaseAdmin } from "@/lib/supabase-admin";

export const MINIO_BUCKET = process.env.MINIO_BUCKET || process.env.SUPABASE_BUCKET || "crm-bucket";
export const MINIO_PUBLIC_URL =
  process.env.NEXT_PUBLIC_MINIO_ENDPOINT || process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`
    : "http://localhost:9000";

// Export a tiny adapter object called `minioClient` so existing imports that
// reference it continue to work at import time. Call-sites should be migrated
// to use `supabaseAdmin.storage` directly where possible. The adapter exposes
// no-op placeholders to avoid runtime errors if accidentally used as before.
export const minioClient = {
  // `send` existed on the old S3 client; preserve the symbol but throw so
  // callers are encouraged to migrate to the Supabase methods instead of
  // relying on AWS SDK commands.
  send: async () => {
    throw new Error("minioClient.send is not supported. Use supabaseAdmin.storage APIs instead.");
  },
  // helper to access the underlying supabase client when needed
  _supabase: supabaseAdmin,
};
