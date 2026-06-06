import { cache } from "react";

import { requireAuthenticated, AuthenticationError } from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getProductsFull = cache(async () => {
  try {
    await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }
  const products = (await supabaseAdmin.from("crm_Products").select("*, category, created_by_user(id, name), _count(accountProducts)").is("deletedAt", null).order("createdAt", { ascending: false })).data;
  return products;
});
