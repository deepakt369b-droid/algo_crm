"use server";
import {
  requireAuthenticated,
  documentReadScopeWhere,
  AuthenticationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getDocuments = async () => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  const documents = (await supabaseAdmin.from("documents").select("*, created_by(id, name, email), assigned_to_user(id, name, email), accounts(account(id, name))").is("parent_document_id", null).order("date_created", { ascending: false })).data;

  return documents;
};
