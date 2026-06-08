import { cache } from "react";
import { unstable_cache } from "next/cache";

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

  return unstable_cache(
    async () => {
      const { data, error } = await supabaseAdmin
    .from("crm_Contacts")
    .select(`
      *,
      assigned_to_user:Users!crm_Contacts_assigned_to_fkey(name),
      crate_by_user:Users!crm_Contacts_createdBy_fkey(name),
      assigned_accounts:crm_Accounts!crm_Contacts_accountsIDs_fkey(id, name),
      opportunities:ContactsToOpportunities!ContactsToOpportunities_contact_id_fkey(
        *,
        opportunity:crm_Opportunities!ContactsToOpportunities_opportunity_id_fkey(id, name)
      ),
      documents:DocumentsToContacts!DocumentsToContacts_contact_id_fkey(
        *,
        document:Documents!DocumentsToContacts_document_id_fkey(id, document_name)
      )
    `);
      if (error) {
        console.error("[CRM_CONTACTS_LIST_ERROR]", error);
        return [];
      }
      return data ?? [];
    },
    ["crm-contacts"],
    { tags: ["crm-contacts"], revalidate: 300 }
  )();
});
