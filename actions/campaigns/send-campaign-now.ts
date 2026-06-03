"use server";

import { inngest } from "@/inngest/client";
import {
  requireRole,
  assertCanReadCampaign,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const sendCampaignNow = async (id: string) => {
  let user;
  try {
    user = await requireRole(["manager", "admin"]);
  } catch (e) {
    if (e instanceof AuthenticationError) return { error: "Unauthorized" };
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    throw e;
  }

  try {
    await assertCanReadCampaign(user, id);
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Not found" };
    throw e;
  }

  const now = new Date();
  (await supabaseAdmin.from("crm_campaigns").update({ status: "sending", scheduled_at: now }).select("*").single().eq("id", id).select("*").single()).data;

  await inngest.send({
    name: "campaigns/send-now",
    data: { campaignId: id },
  });
};
