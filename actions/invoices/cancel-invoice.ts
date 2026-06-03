"use server";


import { getUser } from "@/actions/get-user";
import { canCancelInvoice, type InvoiceStatus } from "@/lib/invoices/permissions";
import { mapLegacyRole } from "@/lib/authz";
import { serializeDecimals } from "@/lib/serialize-decimals";

export async function cancelInvoice(invoiceId: string) {
  const user = await getUser();

  const invoice = (await supabaseAdmin.from("invoices").select("status, createdBy").eq("id", invoiceId).single()).data;

  if (
    !canCancelInvoice(
      { status: invoice.status as InvoiceStatus, createdBy: invoice.createdBy },
      { id: user.id, role: mapLegacyRole(user.role) }
    )
  ) {
    throw new Error("Cannot cancel this invoice");
  }

  const updated = (await supabaseAdmin.from("invoices").update({
        status: "CANCELLED",
        activity: {
          create: { actorId: user.id, action: "CANCELLED" },
        },
      }).eq("id", invoiceId).select("*").single()).data;

  return serializeDecimals(updated);
}
