"use server";

import { revalidatePath } from "next/cache";
import {
  requireAuthenticated,
  assertCanWriteBoard,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const updateSectionTitle = async (data: {
  sectionId: string;
  newTitle: string;
}) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return { error: "Unauthorized" };
    throw e;
  }

  const { sectionId, newTitle } = data;
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
    (await supabaseAdmin.from("sections").update({ title: newTitle }).select("*").single().eq("id", sectionId).select("*").single()).data;

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { success: true };
  } catch (error) {
    console.log("[UPDATE_SECTION_TITLE]", error);
    return { error: "Failed to update section title" };
  }
};
