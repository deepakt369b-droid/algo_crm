"use server";

import {
  requireAuthenticated,
  assertCanWriteAccount,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { writeAuditLog } from "@/lib/audit-log";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const removeAssignment = async (id: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return { error: "Unauthorized" };
    throw e;
  }

  const existing = (await supabaseAdmin.from("crm_AccountProducts").select("accountId").eq("id", id).single()).data;
  if (!existing) {
    return { error: "Not found" };
  }

  try {
    await assertCanWriteAccount(user, existing.accountId);
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    throw e;
  }

  try {
    const assignment = (await supabaseAdmin.from("crm_AccountProducts").update({
            status: "CANCELLED",
            updatedBy: user.id,
            v: { increment: 1 },
          }).select("*").single()).data;

    await writeAuditLog({ entityType: "account_product", entityId: id, action: "cancelled", changes: null, userId: user.id });

    revalidatePath("/[locale]/(routes)/crm/accounts/[accountId]", "page");
    revalidatePath("/[locale]/(routes)/crm/products/[productId]", "page");
    return { data: { id: assignment.id } };
  } catch (error) {
    console.log("[REMOVE_ASSIGNMENT]", error);
    return { error: "Failed to cancel assignment" };
  }
};
