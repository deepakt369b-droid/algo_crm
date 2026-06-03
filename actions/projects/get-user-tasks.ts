
import {
  requireAuthenticated,
  AuthenticationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getUserTasks = async (userId: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  // user role: only allowed to read own tasks.
  if (user.role === "user" && userId !== user.id) {
    return [];
  }

  const data = (await supabaseAdmin.from("tasks").select("*, assigned_user(id, name)").eq("user", userId).order("createdAt", { ascending: false })).data;

  return data;
};
