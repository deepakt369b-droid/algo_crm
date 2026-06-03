import { supabaseAdmin } from "@/lib/supabase-admin";

export const getSalesType = async () => {
  const data = (await supabaseAdmin.from("crm_Opportunities_Type").select("*")).data;
  return data;
};
