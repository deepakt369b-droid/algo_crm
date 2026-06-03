"use server";

import type { Prisma } from "@/lib/prisma-types";
import { requireAuthenticated, isManagerOrAdmin, AuthorizationError } from "@/lib/authz";
import type { ReportCategory } from "./types";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function saveConfig(input: { name: string; category: ReportCategory; filters: Record<string, unknown>; isShared: boolean }) {
  const user = await requireAuthenticated();
  return (await supabaseAdmin.from("crm_Report_Config").insert({
        name: input.name,
        category: input.category,
        filters: input.filters as Prisma.InputJsonValue,
        isShared: input.isShared,
        createdBy: user.id,
      }).select("*").single()).data;
}

export async function loadConfigs(category: ReportCategory) {
  const user = await requireAuthenticated();
  const where: Prisma.crm_Report_ConfigWhereInput = isManagerOrAdmin(user)
    ? { category }
    : { category, OR: [{ createdBy: user.id }, { isShared: true }] };
  return (await supabaseAdmin.from("crm_Report_Config").select("*").order("createdAt", { ascending: false })).data;
}

async function loadAndAuthorize(configId: string, user: { id: string; role: string }) {
  const cfg = (await supabaseAdmin.from("crm_Report_Config").select("*").eq("id", configId).single()).data;
  if (!cfg) throw new Error("Not found");
  if (user.role !== "admin" && user.role !== "manager" && cfg.createdBy !== user.id) {
    throw new AuthorizationError();
  }
  return cfg;
}

export async function deleteConfig(configId: string) {
  const user = await requireAuthenticated();
  await loadAndAuthorize(configId, user);
  return (await supabaseAdmin.from("crm_Report_Config").delete().eq("id", configId).select("*").single()).data;
}

export async function duplicateConfig(configId: string, newName: string) {
  const user = await requireAuthenticated();
  const original = (await supabaseAdmin.from("crm_Report_Config").select("*").eq("id", configId).single()).data;
  if (!original) throw new Error("Not found");
  // Read access: own OR shared OR manager/admin
  if (
    !isManagerOrAdmin(user) &&
    original.createdBy !== user.id &&
    !original.isShared
  ) {
    throw new AuthorizationError();
  }
  return (await supabaseAdmin.from("crm_Report_Config").insert({
        name: newName,
        category: original.category,
        filters: original.filters as Prisma.InputJsonValue,
        isShared: false,
        createdBy: user.id,
      }).select("*").single()).data;
}

export async function toggleShare(configId: string, isShared: boolean) {
  const user = await requireAuthenticated();
  await loadAndAuthorize(configId, user);
  return (await supabaseAdmin.from("crm_Report_Config").update({ isShared }).eq("id", configId).select("*").single()).data;
}
