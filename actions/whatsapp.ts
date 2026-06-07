"use server";

import { revalidatePath } from "next/cache";
import { getTenantId } from "@/lib/get-tenant";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { randomUUID } from "crypto";

async function resolveTenantId(fallbackTenantId?: string) {
  try {
    return (await getTenantId()) || fallbackTenantId || null;
  } catch (error) {
    console.error("[WHATSAPP_TENANT_RESOLUTION_ERROR]", error);
    return fallbackTenantId || null;
  }
}

export async function listInstances(tenantId?: string) {
  try {
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

    return instances || [];
  } catch (err: any) {
    console.error("[WHATSAPP_LIST_INSTANCES_FATAL]", err);
    return [];
  }
}

export async function createInstance(data: { tenantId?: string; instanceName: string; phoneNumber?: string }) {
  try {
    const resolvedTenantId = await resolveTenantId(data.tenantId);
    if (!resolvedTenantId) return { error: "Tenant ID is required for WhatsApp instances." };

    const { data: instance, error } = await supabaseAdmin
      .from("crm_Whatsapp_Instances")
      .insert({
          id: randomUUID(),
          tenantId: resolvedTenantId,
          instanceName: data.instanceName,
          phoneNumber: data.phoneNumber || "",
          status: "PENDING",
        })
      .select("*")
      .single();

    if (error) {
      console.error("[WHATSAPP_CREATE_INSTANCE_ERROR]", error);
      return { error: error.message || "Failed to create WhatsApp instance." };
    }

    revalidatePath("/admin/whatsapp");
    return { data: instance };
  } catch (err: any) {
    console.error("[WHATSAPP_CREATE_INSTANCE_FATAL]", err);
    return { error: err.message || "A fatal error occurred while creating the instance." };
  }
}

export async function updateInstanceConfig(data: { id: string; credentials?: any; connectionConfig?: any; tenantId?: string }) {
  try {
    const resolvedTenantId = await resolveTenantId(data.tenantId);
    if (!resolvedTenantId) return { error: "Tenant ID is required for WhatsApp instances." };

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
      return { error: error.message || "Failed to update WhatsApp instance." };
    }

    revalidatePath("/admin/whatsapp");
    return { data: instance };
  } catch (err: any) {
    console.error("[WHATSAPP_UPDATE_INSTANCE_FATAL]", err);
    return { error: err.message || "A fatal error occurred while updating the instance config." };
  }
}

export async function deleteInstance(data: { id: string; tenantId?: string }) {
  try {
    const resolvedTenantId = await resolveTenantId(data.tenantId);
    if (!resolvedTenantId) return { error: "Tenant ID is required for WhatsApp instances." };

    const { error } = await supabaseAdmin
      .from("crm_Whatsapp_Instances")
      .delete()
      .eq("id", data.id)
      .eq("tenantId", resolvedTenantId);

    if (error) {
      console.error("[WHATSAPP_DELETE_INSTANCE_ERROR]", error);
      return { error: error.message || "Failed to delete WhatsApp instance." };
    }

    revalidatePath("/admin/whatsapp");
    return { success: true };
  } catch (err: any) {
    console.error("[WHATSAPP_DELETE_INSTANCE_FATAL]", err);
    return { error: err.message || "A fatal error occurred while deleting the instance." };
  }
}
