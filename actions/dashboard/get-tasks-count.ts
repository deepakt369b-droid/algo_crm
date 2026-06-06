"use server";

import { requireAuthenticated, AuthenticationError } from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getTasksCount = async () => {
  try {
    const user = await requireAuthenticated();
    if (user.role === "admin" || user.role === "manager") {
      return (await supabaseAdmin.from("Tasks").select("*", { count: 'exact', head: true })).count ?? 0;
    }
    return (await supabaseAdmin.from("Tasks").select("*", { count: 'exact', head: true }).eq("user", user.id)).count ?? 0;
  } catch (e) {
    if (e instanceof AuthenticationError) return 0;
    throw e;
  }
};

export const getUsersTasksCount = async (userId: string) => {
  await requireAuthenticated();
  const data = (await supabaseAdmin.from("Tasks").select("*", { count: 'exact', head: true }).eq("user", userId)).count;
  return data ?? 0;
};
