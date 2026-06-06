"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export interface ProductOption {
  id: string;
  name: string;
  sku: string | null;
}

export async function getProductsForSelect(): Promise<ProductOption[]> {
  const products = (await supabaseAdmin.from("crm_Products").select("id, name, sku").is("deletedAt", null).order("name", { ascending: true })).data;
  return products;
}
