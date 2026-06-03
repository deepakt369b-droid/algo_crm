"use server";

import { requireAuthenticated, isManagerOrAdmin, AuthorizationError } from "@/lib/authz";
import type { ExportFormat } from "./types";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function createSchedule(input: { reportConfigId: string; cronExpression: string; recipients: string[]; format: ExportFormat }) {
  const user = await requireAuthenticated();
  // Verify the user can read the referenced config (own OR shared OR manager/admin)
  const cfg = (await supabaseAdmin.from("crm_Report_Config").select("*").eq("id", input.reportConfigId).single()).data;
  if (!cfg) throw new Error("Not found");
  if (!isManagerOrAdmin(user) && cfg.createdBy !== user.id && !cfg.isShared) {
    throw new AuthorizationError();
  }
  return (await supabaseAdmin.from("crm_Report_Schedule").insert({
          reportConfigId: input.reportConfigId,
          cronExpression: input.cronExpression,
          recipients: input.recipients,
          format: input.format,
          createdBy: user.id,
        }).select("*").single()).data;
}

export async function listSchedules() {
  const user = await requireAuthenticated();
  const where = isManagerOrAdmin(user) ? {} : { createdBy: user.id };
  return (await supabaseAdmin.from("crm_Report_Schedule").select("*, reportConfig").order("createdAt", { ascending: false })).data;
}

async function loadAndAuthorizeSchedule(scheduleId: string, user: { id: string; role: string }) {
  const sched = (await supabaseAdmin.from("crm_Report_Schedule").select("*").eq("id", scheduleId).single()).data;
  if (!sched) throw new Error("Not found");
  if (user.role !== "admin" && user.role !== "manager" && sched.createdBy !== user.id) {
    throw new AuthorizationError();
  }
  return sched;
}

export async function updateSchedule(scheduleId: string, data: { cronExpression?: string; recipients?: string[]; format?: ExportFormat; isActive?: boolean }) {
  const user = await requireAuthenticated();
  await loadAndAuthorizeSchedule(scheduleId, user);
  return supabaseAdmin.from("crm_Report_Schedule").update(data).eq("id", scheduleId).select("*").single();
}

export async function deleteSchedule(scheduleId: string) {
  const user = await requireAuthenticated();
  await loadAndAuthorizeSchedule(scheduleId, user);
  return (await supabaseAdmin.from("crm_Report_Schedule").delete().select("*").single().eq("id", scheduleId).select("*").single()).data;
}
