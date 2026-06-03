import { cache } from "react";

import {
  requireAuthenticated,
  contactReadScopeWhere,
  AuthenticationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getContacts = cache(async () => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  const data = (await supabaseAdmin.from("crm_Contacts").select("*, assigned_to_user(name), crate_by_user(name), assigned_accounts, opportunities(*, opportunity(id, name)), documents(*, document(id, document_name))")).data;
  return data;
});
