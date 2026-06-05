"use server";
import { getSession } from "@/lib/auth-server";

import { supabaseAdmin } from "@/lib/supabase-admin";

const PAGE_SIZE_MAX = 100;

export async function searchUsers({
  search = "",
  skip = 0,
  take = 50,
}: {
  search?: string;
  skip?: number;
  take?: number;
} = {}) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const safeTake = Math.min(PAGE_SIZE_MAX, Math.max(1, take));
  const safeSkip = Math.max(0, skip);

  const where = {
    userStatus: "ACTIVE" as const,
    ...(search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {}),
  };

  const [users, total] = await Promise.all([
    (await supabaseAdmin.from("Users").select("id, name, avatar").order("name", { ascending: true }).limit(safeTake).range(safeSkip, safeSkip + (safeTake - 1))).data,
    (await supabaseAdmin.from("Users").select("*", { count: 'exact', head: true })).count,
  ]);

  return { users, total, hasMore: safeSkip + safeTake < total };
}
