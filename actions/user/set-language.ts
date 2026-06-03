"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";
import { Language } from "@/lib/prisma-types";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const setLanguage = async (data: {
  userId: string;
  language: string;
}) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const { userId, language } = data;

  if (!userId) return { error: "userId is required" };
  if (!language) return { error: "language is required" };

  // Ensure user can only update their own language unless admin
  if (session.user.id !== userId && session.user.role !== "admin") {
    return { error: "Forbidden" };
  }

  try {
    (await supabaseAdmin.from("users").update({ userLanguage: language as Language }).eq("id", userId).select("*").single()).data;
    revalidatePath("/[locale]/(routes)/profile", "page");
    return { language };
  } catch (error) {
    console.log("[SET_LANGUAGE]", error);
    return { error: "Failed to set language" };
  }
};
