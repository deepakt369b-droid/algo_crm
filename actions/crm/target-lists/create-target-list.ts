"use server";
import { getSession } from "@/lib/auth-server";

import { revalidatePath } from "next/cache";

export const createTargetList = async (data: {
  name: string;
  description?: string;
  targetIds?: string[];
}) => {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const { name, description, targetIds = [] } = data;
  if (!name) return { error: "name is required" };

  try {
    const list = (await supabaseAdmin.from("crm_TargetLists").insert({
            name,
            description,
            created_by: (session.user as any).id,
            targets: {
              create: targetIds.map((id: string) => ({ target_id: id })),
            },
          }).select("*").single()).data;
    revalidatePath("/[locale]/(routes)/crm/target-lists", "page");
    return { data: list };
  } catch (error) {
    return { error: "Failed to create target list" };
  }
};
