import { supabaseAdmin } from "@/lib/supabase-admin";

export const getInvoicesCount = async () => {
  const data = (await supabaseAdmin.from("Invoices").select("*", { count: 'exact', head: true })).count;
  return data ?? 0;
};
