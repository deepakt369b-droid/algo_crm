import { supabaseAdmin } from "@/lib/supabase-admin";

export const getActiveUsersCount = async () => {
  const data = (await supabaseAdmin.from("users").select("*", { count: 'exact', head: true }).eq("userStatus", "ACTIVE")).count;
  return data;
};
