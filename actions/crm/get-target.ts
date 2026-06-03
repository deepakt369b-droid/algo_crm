"use server";

import {
  requireAuthenticated,
  assertCanReadTarget,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const getTarget = async (targetId: string) => {
  if (!UUID_REGEX.test(targetId)) return null;

  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return null;
    throw e;
  }

  try {
    await assertCanReadTarget(user, targetId);
  } catch (e) {
    if (e instanceof AuthorizationError) return null;
    throw e;
  }

  const target = (await supabaseAdmin.from("crm_Targets").select("*, crate_by_user(name), target_lists(*, target_list), target_contacts(id, name, email, title, phone, linkedinUrl, source, enrichStatus)").eq("id", targetId).single()).data;
  return target;
};
