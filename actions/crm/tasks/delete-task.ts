"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const deleteTask = async (taskId: string) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  if (!taskId) return { error: "taskId is required" };

  try {
    // CRM account task comments link via `assigned_crm_account_task`, not
    // the Projects-facing `task` FK — see actions/crm/tasks/add-comment.ts.
    (await supabaseAdmin.from("tasksComments").delete().select("*").single().eq("assigned_crm_account_task", taskId)).data;

    (await supabaseAdmin.from("DocumentsToCrmAccountsTasks").delete().select("*").single().eq("crm_accounts_task_id", taskId)).data;

    (await supabaseAdmin.from("crm_Accounts_Tasks").delete().select("*").single().eq("id", taskId).select("*").single()).data;

    revalidatePath("/[locale]/(routes)/crm", "page");
    return { success: true };
  } catch (error) {
    console.log("[DELETE_TASK]", error);
    return { error: "Failed to delete task" };
  }
};
