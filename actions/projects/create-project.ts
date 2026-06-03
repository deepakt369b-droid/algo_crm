"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticated, AuthenticationError } from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const createProject = async (data: {
  title: string;
  description: string;
  visibility: string;
}) => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return { error: "Unauthorized" };
    throw e;
  }

  const { title, description, visibility } = data;
  if (!title) return { error: "Missing project name" };
  if (!description) return { error: "Missing project description" };

  try {
    const boardsCount = (await supabaseAdmin.from("boards").select("*", { count: 'exact', head: true })).count;

    const newBoard = await supabaseAdmin.from("boards").insert({
      data: {
        v: 0,
        user: user.id,
        title,
        description,
        position: boardsCount > 0 ? boardsCount : 0,
        visibility,
        sharedWith: [user.id],
        createdBy: user.id,
      },
    });

    (await supabaseAdmin.from("sections").insert({
              v: 0,
              board: newBoard.id,
              title: "Backlog",
              position: 0,
            }).select("*").single()).data;

    revalidatePath("/[locale]/(routes)/projects", "page");
    return { data: newBoard };
  } catch (error) {
    console.log("[CREATE_PROJECT]", error);
    return { error: "Failed to create project" };
  }
};
