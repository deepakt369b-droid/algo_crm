"use server";

import { revalidatePath } from "next/cache";
import {
  requireAuthenticated,
  assertCanWriteBoard,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const deleteSection = async (sectionId: string) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return { error: "Unauthorized" };
    throw e;
  }

  if (!sectionId) return { error: "Missing section ID" };

  const existing = (await supabaseAdmin.from("sections").select("board").eq("id", sectionId).single()).data;
  if (!existing) return { error: "Not found" };

  try {
    await assertCanWriteBoard(user, existing.board);
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    throw e;
  }

  try {
    (await supabaseAdmin.from("tasks").delete().eq("section", sectionId)).data;

    (await supabaseAdmin.from("sections").delete().eq("id", sectionId).select("*").single()).data;

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { success: true };
  } catch (error) {
    console.log("[DELETE_SECTION]", error);
    return { error: "Failed to delete section" };
  }
};
