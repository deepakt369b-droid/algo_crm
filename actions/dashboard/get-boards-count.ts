import { supabaseAdmin } from "@/lib/supabase-admin";

export const getBoardsCount = async () => {
  const data = (await supabaseAdmin.from("Boards").select("*", { count: 'exact', head: true })).count;
  return data ?? 0;
};
