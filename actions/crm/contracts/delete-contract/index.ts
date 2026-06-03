"use server";
import { getSession } from "@/lib/auth-server";


import { DeleteContract } from "./schema";
import { InputType, ReturnType } from "./types";

import { createSafeAction } from "@/lib/create-safe-action";
import { writeAuditLog } from "@/lib/audit-log";
import { supabaseAdmin } from "@/lib/supabase-admin";

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await getSession();

  if (!session?.user?.email) {
    return {
      error: "User not logged in.",
    };
  }

  const user = (await supabaseAdmin.from("users").select("*").eq("email", session?.user?.email).single()).data;

  if (!user) {
    return {
      error: "User not found.",
    };
  }

  const { id } = data;

  if (!id) {
    return {
      error: "Please fill in all the required fields.",
    };
  }

  try {
    (await supabaseAdmin.from("crm_Contracts").update({ deletedAt: new Date(), deletedBy: user.id }).eq("id", id).select("*").single()).data;
    await writeAuditLog({
      entityType: "contract",
      entityId: id,
      action: "deleted",
      changes: null,
      userId: user.id,
    });
  } catch (error) {
    console.log(error);
    return {
      error:
        "Something went wrong while trying to run DeleteContract action. Please try again.",
    };
  }

  return { data: { id } };
};

export const deleteContract = createSafeAction(DeleteContract, handler);
