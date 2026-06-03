"use server";

import {
  requireAuthenticated,
  assertCanWriteCampaign,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const pauseCampaign = async (id: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return { error: "Unauthorized" };
    throw e;
  }

  try {
    await assertCanWriteCampaign(user, id);
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Not found" };
    throw e;
  }

  return (await supabaseAdmin.from("crm_campaigns").update({ status: "paused" }).select("*").single().eq("id", id).select("*").single()).data;
  // Note: in-flight Inngest jobs check campaign.status at execution start
  // and exit early when status is "paused" — no Inngest API cancellation needed.
};
