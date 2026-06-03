"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export const getIndustries = async () => {
  const data = (await supabaseAdmin.from("crm_Industry_Type").select("*")).data;
  return data;
};
