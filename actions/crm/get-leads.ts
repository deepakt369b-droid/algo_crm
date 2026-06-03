import { cache } from "react";

import {
  requireAuthenticated,
  leadReadScopeWhere,
  AuthenticationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getLeads = cache(async () => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  const data = (await supabaseAdmin.from("crm_Leads").select("*, assigned_to_user(name), assigned_accounts, documents(*, document(id, document_name))").order("createdAt", { ascending: false })).data;
  return data;
});
