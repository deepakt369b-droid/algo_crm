"use server";


import { getUser } from "@/actions/get-user";
import { mapLegacyRole } from "@/lib/authz";
import { canReadInvoice, type InvoiceStatus } from "@/lib/invoices/permissions";
import resendHelper from "@/lib/resend";
import { getInvoicePdfStream } from "@/lib/invoices/storage";
import { InvoiceEmail } from "@/emails/InvoiceEmail";
import { render } from "@react-email/render";

interface SendInvoiceEmailInput {
  invoiceId: string;
  to: string;
  subject?: string;
  message?: string;
}

export async function sendInvoiceEmail(input: SendInvoiceEmailInput) {
  const user = await getUser();

  const invoice = (await supabaseAdmin.from("Invoices").select("id, number, status, createdBy, pdfStorageKey, account(name)").eq("id", input.invoiceId).single()).data;

  if (
    !canReadInvoice(
      { status: invoice.status as InvoiceStatus, createdBy: invoice.createdBy },
      { id: user.id, role: mapLegacyRole(user.role) },
    )
  ) {
    throw new Error("Forbidden");
  }

  if (!invoice.pdfStorageKey) {
    throw new Error("Invoice PDF not generated yet. Please issue the invoice first.");
  }

  // Fetch PDF from storage
  const pdfBody = await getInvoicePdfStream(invoice.pdfStorageKey);
  if (!pdfBody) {
    throw new Error("Failed to retrieve invoice PDF from storage");
  }

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of pdfBody as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  const pdfBuffer = Buffer.concat(chunks);

  const resend = await resendHelper();
  const fromEmail = process.env.EMAIL_FROM ?? `invoices@${process.env.NEXT_PUBLIC_APP_DOMAIN ?? "flowlinepro.app"}`;

  const subject =
    input.subject ?? `Invoice ${invoice.number ?? invoice.id} — ${invoice.account.name}`;
  const message =
    input.message ?? "Please find attached your invoice as a PDF.";

  const html = await render(
    InvoiceEmail({
      number: invoice.number ?? "",
      message,
      userLanguage: user.userLanguage ?? "en",
    })
  );

  await resend.emails.send({
    from: fromEmail,
    to: input.to,
    subject,
    html,
    attachments: [
      {
        filename: `invoice-${invoice.number ?? invoice.id}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  // Update status to SENT only if currently ISSUED
  if (invoice.status === "ISSUED") {
    (await supabaseAdmin.from("Invoices").update({
              status: "SENT",
              activity: {
                create: {
                  actorId: user.id,
                  action: "SENT",
                  meta: { to: input.to, subject },
                },
              },
            }).eq("id", invoice.id).select("*").single()).data;
  } else {
    // Log activity even if we don't change status
    (await supabaseAdmin.from("Invoice_Activity").insert({
              invoiceId: invoice.id,
              actorId: user.id,
              action: "EMAIL_SENT",
              meta: { to: input.to, subject },
            }).select("*").single()).data;
  }

  return { success: true };
}
