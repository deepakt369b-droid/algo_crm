"use server";

import { revalidatePath } from "next/cache";

import { getUser } from "@/actions/get-user";
import { mapLegacyRole } from "@/lib/authz";
import { canReadInvoice, type InvoiceStatus } from "@/lib/invoices/permissions";
import { renderInvoicePdf } from "@/lib/invoices/pdf/render";
import { uploadInvoicePdf } from "@/lib/invoices/storage";
import { buildInvoicePdfData } from "@/lib/invoices/pdf/build-pdf-data";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type RegenerateResult =
  | { ok: true; pdfGeneratedAt: string }
  | { ok: false; error: string };

export async function regenerateInvoicePdf(
  invoiceId: string
): Promise<RegenerateResult> {
  let user;
  try {
    user = await getUser();
  } catch {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    const invoice = (await supabaseAdmin.from("Invoices").select("*, lineItems(*, taxRate(*)), account(*)").eq("id", invoiceId).single()).data;

    // Permission: manager/admin OR the creator of the invoice
    if (
      !canReadInvoice(
        { status: invoice.status as InvoiceStatus, createdBy: invoice.createdBy },
        { id: user.id, role: mapLegacyRole(user.role) },
      )
    ) {
      return { ok: false, error: "Forbidden" };
    }

    if (invoice.status === "DRAFT") {
      return {
        ok: false,
        error: "Draft invoices don't have PDFs — issue the invoice first",
      };
    }

    if (!invoice.number || !invoice.issueDate) {
      return {
        ok: false,
        error: "Invoice is missing number or issue date",
      };
    }

    const settings = (await supabaseAdmin.from("Invoice_Settings").select("*").single()).data;

    const pdfData = buildInvoicePdfData(
      invoice,
      settings,
      user.userLanguage ?? "en"
    );

    const pdfBuffer = await renderInvoicePdf(pdfData);
    const storageKey = await uploadInvoicePdf(invoice.id, pdfBuffer);

    const pdfGeneratedAt = new Date();
    (await supabaseAdmin.from("Invoices").update({ pdfStorageKey: storageKey, pdfGeneratedAt }).eq("id", invoice.id).select("*").single()).data;

    revalidatePath(`/invoices/${invoiceId}`);
    return { ok: true, pdfGeneratedAt: pdfGeneratedAt.toISOString() };
  } catch (err) {
    console.error("[regenerateInvoicePdf] failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }
}
