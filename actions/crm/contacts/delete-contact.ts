"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit-log";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const deleteContact = async (contactId: string) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  if (!contactId) return { error: "contactId is required" };

  try {
    (await supabaseAdmin.from("crm_Contacts").update({ deletedAt: new Date(), deletedBy: session.user.id }).eq("id", contactId).select("*").single()).data;
    await writeAuditLog({
      entityType: "contact",
      entityId: contactId,
      action: "deleted",
      changes: null,
      userId: session.user.id,
    });
    revalidatePath("/[locale]/(routes)/crm/contacts", "page");
    return { success: true };
  } catch (error) {
    console.log("[DELETE_CONTACT]", error);
    return { error: "Failed to delete contact" };
  }
};
