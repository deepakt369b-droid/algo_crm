"use server";
import { getSession } from "@/lib/auth-server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function getUserById(userId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const user = (await supabaseAdmin.from("users").select("id, name, avatar").eq("id", userId).eq("userStatus", "ACTIVE").single()).data;

  return user ?? null;
}
