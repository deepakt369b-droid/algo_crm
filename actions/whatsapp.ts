"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function listInstances(tenantId: string) {
  const instances = await db.crm_Whatsapp_Instances.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
  return instances;
}

export async function createInstance(data: { tenantId: string; instanceName: string; phoneNumber?: string }) {
  const instance = await db.crm_Whatsapp_Instances.create({
    data: {
      tenantId: data.tenantId,
      instanceName: data.instanceName,
      phoneNumber: data.phoneNumber || "",
      status: "DISCONNECTED",
    },
  });
  revalidatePath("/admin/whatsapp");
  return instance;
}

export async function updateInstanceConfig(data: { id: string; credentials?: any; connectionConfig?: any; tenantId: string }) {
  const instance = await db.crm_Whatsapp_Instances.update({
    where: { id: data.id, tenantId: data.tenantId },
    data: {
      credentials: data.credentials,
      connectionConfig: data.connectionConfig,
    },
  });
  revalidatePath("/admin/whatsapp");
  return instance;
}

export async function deleteInstance(data: { id: string; tenantId: string }) {
  await db.crm_Whatsapp_Instances.delete({
    where: { id: data.id, tenantId: data.tenantId },
  });
  revalidatePath("/admin/whatsapp");
  return { success: true };
}
