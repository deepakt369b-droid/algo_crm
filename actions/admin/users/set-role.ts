"use server";

import { revalidatePath } from "next/cache";
import { APP_ROLES, AppRole, requireRole, AuthorizationError } from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const setUserRole = async (userId: string, role: AppRole) => {
  let actor;
  try {
    actor = await requireRole(["admin"]);
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    return { error: "Unauthorized" };
  }

  if (!userId) return { error: "userId is required" };
  if (!APP_ROLES.includes(role)) return { error: "Invalid role" };

  if (userId === actor.id && role !== "admin") {
    return { error: "Cannot remove your own admin role" };
  }

  try {
    const user = (await supabaseAdmin.from("Users").update({ role }).select("*").single().eq("id", userId).select("*").single()).data;
    revalidatePath("/[locale]/(routes)/admin", "page");
    return { data: user };
  } catch (error) {
    console.log("[SET_USER_ROLE]", error);
    return { error: "Failed to update user role" };
  }
};
