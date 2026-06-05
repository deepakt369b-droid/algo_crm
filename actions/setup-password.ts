"use server";

import { createClient } from "@/lib/supabase/server";

export async function setupPassword(password: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Unauthorized" };
    }

    if (!password || password.length < 8) {
      return { error: "Password must be at least 8 characters long" };
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message || "Failed to set password" };

    return { success: true };
  } catch (error: any) {
    console.error("[SETUP_PASSWORD_ERROR]", error);
    return { error: "Internal Server Error" };
  }
}
