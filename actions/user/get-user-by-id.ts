"use server";
import { getSession } from "@/lib/auth-server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function getUserById(userId: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    const user = (await supabaseAdmin.from("Users").select("id, name, avatar").eq("id", userId).eq("userStatus", "ACTIVE").single()).data;
    return user ?? null;
  } catch (error) {
    console.error("[GET_USER_BY_ID_ERROR]", error);
    return null;
  }
}
