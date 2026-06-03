import { minioClient, MINIO_BUCKET } from "@/lib/minio";
import { supabaseAdmin } from "@/lib/supabase-admin";

function invoiceKey(invoiceId: string) {
  return `invoices/${invoiceId}.pdf`;
}

export async function uploadInvoicePdf(invoiceId: string, pdf: Buffer): Promise<string> {
  const key = invoiceKey(invoiceId);
  // Use Supabase storage upload
  await supabaseAdmin.storage.from(MINIO_BUCKET).upload(key, pdf, { contentType: "application/pdf", upsert: true });
  return key;
}

export async function getInvoicePdfStream(key: string) {
  const { data, error } = await supabaseAdmin.storage.from(MINIO_BUCKET).download(key);
  if (error) throw error;
  return data;
}

export async function getInvoicePdfPresignedUrl(
  key: string,
  expirySeconds = 300,
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage.from(MINIO_BUCKET).createSignedUrl(key, expirySeconds);
  if (error || !data) throw error ?? new Error("Failed to create signed URL");
  // `createSignedUrl` returns an object with a `signedUrl` or `signedURL` property depending on client version
  return (data as any).signedUrl || (data as any).signedURL || (data as any).signed_upload_url || (data as any).signedUploadUrl || (data as any).url;
}

export async function uploadInvoiceAttachment(
  invoiceId: string,
  attachmentId: string,
  buf: Buffer,
  mime: string,
): Promise<string> {
  const key = `invoices/${invoiceId}/attachments/${attachmentId}`;
  await supabaseAdmin.storage.from(MINIO_BUCKET).upload(key, buf, { contentType: mime, upsert: true });
  return key;
}
