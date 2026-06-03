"use server";

import { revalidatePath } from "next/cache";

export async function listInstances(tenantId: string) {
  const instances = (await supabaseAdmin.from("crm_Whatsapp_Instances").select("*").order("createdAt", { ascending: false })).data;
  return instances;
}

export async function createInstance(data: { tenantId: string; instanceName: string; phoneNumber?: string }) {
  const instance = (await supabaseAdmin.from("crm_Whatsapp_Instances").insert({
        tenantId: data.tenantId,
        instanceName: data.instanceName,
        phoneNumber: data.phoneNumber || "",
        status: "DISCONNECTED",
      }).select("*").single()).data;
  revalidatePath("/admin/whatsapp");
  return instance;
}

export async function updateInstanceConfig(data: { id: string; credentials?: any; connectionConfig?: any; tenantId: string }) {
  const instance = (await supabaseAdmin.from("crm_Whatsapp_Instances").update({
        credentials: data.credentials,
        connectionConfig: data.connectionConfig,
      }).eq("id", data.id).eq("tenantId", data.tenantId).select("*").single()).data;
  revalidatePath("/admin/whatsapp");
  return instance;
}

export async function deleteInstance(data: { id: string; tenantId: string }) {
  (await supabaseAdmin.from("crm_Whatsapp_Instances").delete().eq("id", data.id).eq("tenantId", data.tenantId).select("*").single()).data;
  revalidatePath("/admin/whatsapp");
  return { success: true };
}
