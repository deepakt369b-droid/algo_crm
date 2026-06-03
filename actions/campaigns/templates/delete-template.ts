"use server";

import {
  requireAuthenticated,
  assertCanWriteTemplate,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const deleteTemplate = async (id: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return { error: "Unauthorized" };
    throw e;
  }

  try {
    await assertCanWriteTemplate(user, id);
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Not found" };
    throw e;
  }

  return (await supabaseAdmin.from("crm_campaign_templates").update({ deletedAt: new Date(), deletedBy: user.id }).eq("id", id).select("*").single()).data;
};
