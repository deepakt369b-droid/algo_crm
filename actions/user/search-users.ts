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

  // Sanitize search input for PostgREST `ilike` — escape %, _ and \ so
  // a user typing "%" doesn't get a wildcard match.
  const safeSearch = search.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");

  try {
    // Build the data query with the same filter the `where` constant
    // used to express in dead code.
    let dataQuery = supabaseAdmin
      .from("Users")
      .select("id, name, avatar")
      .eq("userStatus", "ACTIVE")
      .order("name", { ascending: true })
      .range(safeSkip, safeSkip + (safeTake - 1));
    if (safeSearch) {
      dataQuery = dataQuery.ilike("name", `%${safeSearch}%`);
    }

    // Count the *filtered* set so hasMore is correct when searching.
    let countQuery = supabaseAdmin
      .from("Users")
      .select("*", { count: "exact", head: true })
      .eq("userStatus", "ACTIVE");
    if (safeSearch) {
      countQuery = countQuery.ilike("name", `%${safeSearch}%`);
    }

    const [usersRes, countRes] = await Promise.all([dataQuery, countQuery]);

    const users = usersRes.data || [];
    const total = countRes.count || 0;

    return { users, total, hasMore: safeSkip + safeTake < total };
  } catch (error) {
    console.error("[SEARCH_USERS_ERROR]", error);
    return { users: [], total: 0, hasMore: false };
  }
}
