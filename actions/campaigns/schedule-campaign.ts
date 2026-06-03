"use server";

import { inngest } from "@/inngest/client";
import {
  requireRole,
  assertCanReadCampaign,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const scheduleCampaign = async (id: string, scheduledAt: Date) => {
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

  const campaign = (await supabaseAdmin.from("crm_campaigns").update({
        status: "scheduled",
        scheduled_at: scheduledAt,
        steps: {
          updateMany: {
            where: { order: 0 },
            data: { scheduled_at: scheduledAt },
          },
        },
      }).select("*").single()).data;

  await inngest.send({
    name: "campaigns/schedule",
    data: { campaignId: id, scheduledAt: scheduledAt.toISOString() },
  });

  return campaign;
};
