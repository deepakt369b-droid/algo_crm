import { supabaseAdmin } from "@/lib/supabase-admin";

export const getDocumentsCount = async () => {
  const data = (await supabaseAdmin.from("Documents").select("*", { count: 'exact', head: true })).count;
  return data ?? 0;
};
