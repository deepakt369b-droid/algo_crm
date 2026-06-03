"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const assignDocumentToCrmTask = async (data: {
  documentId: string;
  taskId: string;
}) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const { documentId, taskId } = data;
  if (!documentId) return { error: "Missing document ID" };
  if (!taskId) return { error: "Missing task ID" };

  try {
    const task = (await supabaseAdmin.from("crm_Accounts_Tasks").select("*").eq("id", taskId).single()).data;

    if (!task) return { error: "CRM task not found" };

    (await supabaseAdmin.from("documentsToCrmAccountsTasks").insert({
                  document_id: documentId,
                  crm_accounts_task_id: taskId,
                }).select("*").single()).data;

    revalidatePath("/[locale]/(routes)/crm", "page");
    return { success: true };
  } catch (error) {
    console.log("[ASSIGN_DOCUMENT_TO_CRM_TASK]", error);
    return { error: "Failed to assign document to CRM task" };
  }
};

export const disconnectDocumentFromCrmTask = async (data: {
  documentId: string;
  taskId: string;
}) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const { documentId, taskId } = data;
  if (!documentId) return { error: "Missing document ID" };
  if (!taskId) return { error: "Missing task ID" };

  try {
    const task = (await supabaseAdmin.from("crm_Accounts_Tasks").select("*").eq("id", taskId).single()).data;

    if (!task) return { error: "CRM task not found" };

    (await supabaseAdmin.from("documentsToCrmAccountsTasks").delete().select("*").single()).data;

    revalidatePath("/[locale]/(routes)/crm", "page");
    return { success: true };
  } catch (error) {
    console.log("[DISCONNECT_DOCUMENT_FROM_CRM_TASK]", error);
    return { error: "Failed to disconnect document from CRM task" };
  }
};
