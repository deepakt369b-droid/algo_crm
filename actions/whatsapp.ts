"use server";

import { revalidatePath } from "next/cache";
import { getTenantId } from "@/lib/get-tenant";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Fallback UUID generator that works in ANY environment (Node, Edge, Browser, Cloudflare)
function generateSafeUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  // Fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
    console.log("[WHATSAPP_ACTION] createInstance called", { instanceName: data.instanceName });
    
    const resolvedTenantId = await resolveTenantId(data.tenantId);
    if (!resolvedTenantId) {
      console.warn("[WHATSAPP_ACTION] No tenant ID resolved");
      return { error: "Tenant ID is required for WhatsApp instances." };
    }

    const newId = generateSafeUUID();
    console.log("[WHATSAPP_ACTION] Generated UUID:", newId);

    const { data: instance, error } = await supabaseAdmin
      .from("crm_Whatsapp_Instances")
      .insert({
          id: newId,
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

    console.log("[WHATSAPP_ACTION] Successfully created instance:", instance.id);
    
    try {
      revalidatePath("/admin/whatsapp");
    } catch (revalErr) {
      console.error("[WHATSAPP_CREATE_INSTANCE_REVALIDATE_ERROR]", revalErr);
    }
    
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

    try {
      revalidatePath("/admin/whatsapp");
    } catch (revalErr) {
      // Ignore
    }
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

    try {
      revalidatePath("/admin/whatsapp");
    } catch (revalErr) {
      // Ignore
    }
    return { success: true };
  } catch (err: any) {
    console.error("[WHATSAPP_DELETE_INSTANCE_FATAL]", err);
    return { error: err.message || "A fatal error occurred while deleting the instance." };
  }
}
