"use server";

import { revalidatePath } from "next/cache";
import {
  requireRole,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const deleteUser = async (userId: string) => {
  try {
    await requireRole(["admin"]);
  } catch (e) {
    if (e instanceof AuthenticationError) return { error: "Unauthorized" };
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    throw e;
  }

  if (!userId) return { error: "userId is required" };

  try {
    const user = (await supabaseAdmin.from("users").delete().select("*").single().eq("id", userId).select("id, name, email, username, account_name, avatar, role, userLanguage, userStatus, lastLoginAt").single()).data;
    revalidatePath("/[locale]/(routes)/admin", "page");
    return { data: user };
  } catch (error) {
    console.log("[DELETE_USER]", error);
    return { error: "Failed to delete user" };
  }
};
