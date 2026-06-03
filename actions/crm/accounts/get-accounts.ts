"use server";

import {
  requireAuthenticated,
  accountReadScopeWhere,
  AuthenticationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getAccounts = async () => {
  try {
    const user = await requireAuthenticated();
    const accounts = (await supabaseAdmin.from("crm_Accounts").select("id, name").order("name", { ascending: true })).data;
    return { data: accounts };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return { error: "Unauthorized" };
    }
    return { error: "Failed to fetch accounts" };
  }
};
