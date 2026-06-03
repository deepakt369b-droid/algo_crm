"use server";

import {
  requireAuthenticated,
  assertCanReadCampaign,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getCampaign = async (id: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return null;
    throw e;
  }

  try {
    await assertCanReadCampaign(user, id);
  } catch (e) {
    if (e instanceof AuthorizationError) return null;
    throw e;
  }

  return (await supabaseAdmin.from("crm_campaigns").select("*, template, steps(*, template, sends(status, opened_at, clicked_at, unsubscribed_at)), target_lists(*, target_list(id, name)), sends(*, target(first_name, last_name))").eq("id", id).single()).data;
};
