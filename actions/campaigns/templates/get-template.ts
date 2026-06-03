"use server";

import {
  requireAuthenticated,
  assertCanReadTemplate,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getTemplate = async (id: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return null;
    throw e;
  }

  try {
    await assertCanReadTemplate(user, id);
  } catch (e) {
    if (e instanceof AuthorizationError) return null;
    throw e;
  }

  return (await supabaseAdmin.from("crm_campaign_templates").select("*, created_by_user(name)").eq("id", id).eq("deletedAt", null).single()).data;
};
