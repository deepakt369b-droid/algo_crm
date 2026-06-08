import { cache } from "react";
import { unstable_cache } from "next/cache";

import { requireAuthenticated, accountReadScopeWhere } from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getAccounts = cache(async () => {
  const user = await requireAuthenticated();
  return unstable_cache(
    async () => {
      const { data, error } = await supabaseAdmin
    .from("crm_Accounts")
    .select(`
      *,
      assigned_to_user:Users!crm_Accounts_assigned_to_fkey(name),
      contacts:crm_Contacts!crm_Contacts_accountsIDs_fkey(first_name, last_name)
    `)
    .order("createdAt", { ascending: false });
      if (error) {
        console.error("[CRM_ACCOUNTS_LIST_ERROR]", error);
        return [];
      }
      return data ?? [];
    },
    ["crm-accounts"],
    { tags: ["crm-accounts"], revalidate: 300 }
  )();
});
