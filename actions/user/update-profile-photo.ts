"use server";
import { getSession } from "@/lib/auth-server";


import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function updateProfilePhoto(avatar: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  if (!avatar) throw new Error("No avatar provided");

  (await supabaseAdmin.from("Users").update({ avatar }).select("*").single().eq("id", session.user.id).select("*").single()).data;

  revalidatePath("/[locale]/profile");
}
