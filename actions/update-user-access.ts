"use server";


import { getSession } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function updateUserAccess(userId: string, accessibleTabs: string[]) {
  const session = await getSession();

  if (session?.user?.role !== "admin" && session?.user?.role !== "superadmin") {
    throw new Error("Unauthorized");
  }

  (await supabaseAdmin.from("users").update({
          accessibleTabs,
        }).eq("id", userId).select("*").single()).data;

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}/access`);
  return { success: true };
}
