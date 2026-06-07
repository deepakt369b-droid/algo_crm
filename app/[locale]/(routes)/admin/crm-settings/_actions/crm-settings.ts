"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole, AuthenticationError, AuthorizationError } from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function ensureAdmin(): Promise<{ error: string } | null> {
  try {
    await requireRole(["admin"]);
    return null;
  } catch (e) {
    if (e instanceof AuthenticationError) return { error: "Unauthorized" };
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    throw e;
  }
}

export type CrmConfigType =
  | "industry"
  | "contactType"
  | "leadSource"
  | "leadStatus"
  | "leadType"
  | "opportunityType"
  | "salesStage";

export type ConfigValue = { id: string; name: string; usageCount: number };

const nameSchema = z.string().trim().min(1, "Name is required").max(100, "Max 100 characters");

const configMap = {
  industry:        { model: "crm_Industry_Type",               updateMany: null,               countTable: "crm_Accounts" },
  contactType:     { model: "crm_Contact_Types",               updateMany: "crm_Contacts",     countTable: "crm_Contacts" },
  leadSource:      { model: "crm_Lead_Sources",                updateMany: "crm_Leads",        countTable: "crm_Leads" },
  leadStatus:      { model: "crm_Lead_Statuses",               updateMany: "crm_Leads",        countTable: "crm_Leads" },
  leadType:        { model: "crm_Lead_Types",                  updateMany: "crm_Leads",        countTable: "crm_Leads" },
  opportunityType: { model: "crm_Opportunities_Type",          updateMany: null,               countTable: "crm_Opportunities" },
  salesStage:      { model: "crm_Opportunities_Sales_Stages",  updateMany: null,               countTable: "crm_Opportunities" },
} as const;

const fkField: Record<CrmConfigType, string | null> = {
  industry:        "industry",
  contactType:     "contact_type_id",
  leadSource:      "lead_source_id",
  leadStatus:      "lead_status_id",
  leadType:        "lead_type_id",
  opportunityType: "type",
  salesStage:      "sales_stage",
};

export async function getConfigValues(configType: CrmConfigType): Promise<ConfigValue[]> {
  const denied = await ensureAdmin();
  if (denied) throw new Error(denied.error);
  const { model, countTable } = configMap[configType];
  const fk = fkField[configType];

  const { data, error } = await supabaseAdmin
    .from(model)
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  const rows = data || [];

  if (countTable && fk) {
    const { data: usageData } = await supabaseAdmin.from(countTable).select(fk);
    const counts = (usageData || []).reduce((acc: any, row: any) => {
      const val = row[fk];
      if (val) acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      usageCount: counts[r.id] || 0,
    }));
  }

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    usageCount: 0,
  }));
}

export async function createConfigValue(configType: CrmConfigType, name: string): Promise<void> {
  const denied = await ensureAdmin();
  if (denied) throw new Error(denied.error);
  const parsed = nameSchema.parse(name);
  const { model } = configMap[configType];
  const { error } = await supabaseAdmin.from(model).insert({ name: parsed, v: 0 });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function updateConfigValue(
  configType: CrmConfigType,
  id: string,
  name: string
): Promise<void> {
  const denied = await ensureAdmin();
  if (denied) throw new Error(denied.error);
  const parsed = nameSchema.parse(name);
  const { model } = configMap[configType];
  const { error } = await supabaseAdmin.from(model).update({ name: parsed }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteConfigValue(
  configType: CrmConfigType,
  id: string,
  replacementId?: string
): Promise<void> {
  const denied = await ensureAdmin();
  if (denied) throw new Error(denied.error);
  if (replacementId !== undefined && replacementId === id) {
    throw new Error("replacementId must differ from id");
  }

  const { model, updateMany } = configMap[configType];

  if (replacementId && !updateMany) {
    throw new Error(`Config type does not support reassignment`);
  }
  const field = fkField[configType];

  if (replacementId && updateMany && field) {
    const { error: updateErr } = await supabaseAdmin
      .from(updateMany)
      .update({ [field]: replacementId })
      .eq(field, id);
    if (updateErr) throw new Error(updateErr.message);
  }

  const { error: delErr } = await supabaseAdmin.from(model).delete().eq("id", id);
  if (delErr) throw new Error(delErr.message);

  revalidatePath("/", "layout");
}
