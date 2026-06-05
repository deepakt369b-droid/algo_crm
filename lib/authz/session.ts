import { getSession } from "@/lib/auth-server";

import { AppRole, mapLegacyRole } from "./roles";
import { AuthenticationError, AuthorizationError } from "./errors";
import { supabaseAdmin } from "@/lib/supabase-admin";

export interface AuthzUser {
  id: string;
  role: AppRole;
}

export async function requireAuthenticated(): Promise<AuthzUser> {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) throw new AuthenticationError();

  const dbUser = (await supabaseAdmin.from("Users").select("id, role").eq("id", userId).single()).data;
  if (!dbUser) throw new AuthenticationError();

  return { id: dbUser.id, role: mapLegacyRole(dbUser.role) };
}

export async function requireRole(
  allowedRoles: ReadonlyArray<AppRole>
): Promise<AuthzUser> {
  const user = await requireAuthenticated();
  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError();
  }
  return user;
}

export function isAdmin(user: AuthzUser): boolean {
  return user.role === "admin";
}

export function isManagerOrAdmin(user: AuthzUser): boolean {
  return user.role === "manager" || user.role === "admin";
}
