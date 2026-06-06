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
  const { data: products, error } = await supabaseAdmin
    .from("crm_Products")
    .select(`
      *,
      category:crm_ProductCategories!crm_Products_categoryId_fkey(id, name),
      created_by_user:Users!crm_Products_createdBy_fkey(id, name),
      accountProducts:crm_AccountProducts!crm_AccountProducts_productId_fkey(id)
    `)
    .is("deletedAt", null)
    .order("createdAt", { ascending: false });
  if (error) {
    console.error("[CRM_PRODUCTS_LIST_ERROR]", error);
    return [];
  }
  return (products ?? []).map((product: any) => ({
    ...product,
    _count: {
      accountProducts: product.accountProducts?.length ?? 0,
    },
  }));
});
