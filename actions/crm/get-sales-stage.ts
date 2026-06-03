import { supabaseAdmin } from "@/lib/supabase-admin";

export const getSaleStages = async () => {
  const data = (await supabaseAdmin.from("crm_Opportunities_Sales_Stages").select("*").order("probability", { ascending: true })).data;
  return data;
};
