import { cache } from "react";

import { requireAuthenticated, AuthenticationError } from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getProduct = cache(async (id: string) => {
  try {
    await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return null;
    throw e;
  }
  const product = (await supabaseAdmin.from("crm_Products").select("*, category, created_by_user(id, name), accountProducts(*, account(id, name))").eq("id", id).single()).data;
  return product;
});
