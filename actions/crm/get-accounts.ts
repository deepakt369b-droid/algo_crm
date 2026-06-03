import { cache } from "react";

import { requireAuthenticated, accountReadScopeWhere } from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getAccounts = cache(async () => {
  const user = await requireAuthenticated();
  const data = (await supabaseAdmin.from("crm_Accounts").select("*, assigned_to_user(name), contacts(first_name, last_name), watchers(*, user(id, name, email, avatar))").order("createdAt", { ascending: false })).data;
  return data;
});
