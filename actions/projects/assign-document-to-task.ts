"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import {
  requireAuthenticated,
  assertCanWriteTask,
  assertCanReadDocument,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const assignDocumentToTask = async (data: {
  documentId: string;
  taskId: string;
}) => {
  let authzUser;
  try {
    authzUser = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return { error: "Unauthorized" };
    throw e;
  }

  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const { documentId, taskId } = data;
  if (!documentId) return { error: "Missing document ID" };
  if (!taskId) return { error: "Missing task ID" };

  try {
    await assertCanWriteTask(authzUser, taskId);
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    throw e;
  }
  try {
    await assertCanReadDocument(authzUser, documentId);
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    throw e;
  }

  try {
    const task = (await supabaseAdmin.from("tasks").select("*").eq("id", taskId).single()).data;

    if (!task) return { error: "Task not found" };

    (await supabaseAdmin.from("documentsToTasks").insert({
                  document_id: documentId,
                  task_id: taskId,
                }).select("*").single()).data;

    (await supabaseAdmin.from("tasks").update({ updatedBy: session.user.id }).select("*").single().eq("id", taskId).select("*").single()).data;

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { success: true };
  } catch (error) {
    console.log("[ASSIGN_DOCUMENT_TO_TASK]", error);
    return { error: "Failed to assign document to task" };
  }
};

export const disconnectDocumentFromTask = async (data: {
  documentId: string;
  taskId: string;
}) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const { documentId, taskId } = data;
  if (!documentId) return { error: "Missing document ID" };
  if (!taskId) return { error: "Missing task ID" };

  try {
    const task = (await supabaseAdmin.from("tasks").select("*").eq("id", taskId).single()).data;

    if (!task) return { error: "Task not found" };

    (await supabaseAdmin.from("documentsToTasks").delete().select("*").single()).data;

    const updatedTask = (await supabaseAdmin.from("tasks").update({ updatedBy: session.user.id }).select("*").single().eq("id", taskId).select("*").single()).data;

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { data: updatedTask };
  } catch (error) {
    console.log("[DISCONNECT_DOCUMENT_FROM_TASK]", error);
    return { error: "Failed to disconnect document from task" };
  }
};
