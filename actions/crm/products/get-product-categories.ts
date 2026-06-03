import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getProductCategories = cache(async () => {
  const categories = (await supabaseAdmin.from("crm_ProductCategories").select("*").eq("isActive", true).order("order", { ascending: true })).data;
  return categories;
});
