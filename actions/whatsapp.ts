"use server";

import { revalidatePath } from "next/cache";
import { getTenantId } from "@/lib/get-tenant";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function resolveTenantId(fallbackTenantId?: string) {
  try {
    return (await getTenantId()) || fallbackTenantId || null;
  } catch (error) {
    console.error("[WHATSAPP_TENANT_RESOLUTION_ERROR]", error);
    return fallbackTenantId || null;
  }
}

export async function listInstances(tenantId?: string) {
  const resolvedTenantId = await resolveTenantId(tenantId);
  if (!resolvedTenantId) return [];

  const { data: instances, error } = await supabaseAdmin
    .from("crm_Whatsapp_Instances")
    .select("*")
    .eq("tenantId", resolvedTenantId)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("[WHATSAPP_LIST_INSTANCES_ERROR]", error);
    return [];
  }

  return instances;
}

export async function createInstance(data: { tenantId: string; instanceName: string; phoneNumber?: string }) {
  const resolvedTenantId = await resolveTenantId(data.tenantId);
  if (!resolvedTenantId) throw new Error("Tenant ID is required for WhatsApp instances.");

  const { data: instance, error } = await supabaseAdmin
    .from("crm_Whatsapp_Instances")
    .insert({
        tenantId: resolvedTenantId,
        instanceName: data.instanceName,
        phoneNumber: data.phoneNumber || "",
        status: "DISCONNECTED",
      })
    .select("*")
    .single();

  if (error) {
    console.error("[WHATSAPP_CREATE_INSTANCE_ERROR]", error);
    throw new Error("Failed to create WhatsApp instance.");
  }

  revalidatePath("/admin/whatsapp");
  return instance;
}

export async function updateInstanceConfig(data: { id: string; credentials?: any; connectionConfig?: any; tenantId: string }) {
  const resolvedTenantId = await resolveTenantId(data.tenantId);
  if (!resolvedTenantId) throw new Error("Tenant ID is required for WhatsApp instances.");

  const { data: instance, error } = await supabaseAdmin
    .from("crm_Whatsapp_Instances")
    .update({
        credentials: data.credentials,
        connectionConfig: data.connectionConfig,
      })
    .eq("id", data.id)
    .eq("tenantId", resolvedTenantId)
    .select("*")
    .single();

  if (error) {
    console.error("[WHATSAPP_UPDATE_INSTANCE_ERROR]", error);
    throw new Error("Failed to update WhatsApp instance.");
  }

  revalidatePath("/admin/whatsapp");
  return instance;
}

export async function deleteInstance(data: { id: string; tenantId: string }) {
  const resolvedTenantId = await resolveTenantId(data.tenantId);
  if (!resolvedTenantId) throw new Error("Tenant ID is required for WhatsApp instances.");

  const { error } = await supabaseAdmin
    .from("crm_Whatsapp_Instances")
    .delete()
    .eq("id", data.id)
    .eq("tenantId", resolvedTenantId);

  if (error) {
    console.error("[WHATSAPP_DELETE_INSTANCE_ERROR]", error);
    throw new Error("Failed to delete WhatsApp instance.");
  }

  revalidatePath("/admin/whatsapp");
  return { success: true };
}
