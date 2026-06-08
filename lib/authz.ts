import { getSession } from "@/lib/auth-server";

/**
 * Thrown when a user is not signed in.
 * Server actions and server components should catch this and return a
 * `{ error: "Unauthorized" }` shape so the client can react gracefully
 * without the error boundary firing.
 */
export class AuthenticationError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Thrown when a user is signed in but does not have permission to do
 * the requested operation.
 */
export class AuthorizationError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "AuthorizationError";
  }
}

const VALID_ROLES = ["user", "manager", "admin", "superadmin"] as const;
export type Role = (typeof VALID_ROLES)[number];

export async function requireAuthenticated() {
  const s = await getSession();
  if (!s) throw new AuthenticationError();
  return s.user;
}

export async function requireRole(roles: Role[]) {
  const user = await requireAuthenticated();
  const role = user.role as string;
  if (!roles.includes(role as Role)) throw new AuthorizationError();
  return user;
}

/**
 * Builds a PostgREST filter for `crm_Leads` that scopes the read to
 * records the user is allowed to see.
 *
 * Admins and superadmins see everything. Managers see leads assigned
 * to them or in the same tenant. Plain users see only the leads
 * assigned to them.
 *
 * Returns an empty string for unrestricted access (admins) or a
 * PostgREST filter expression otherwise. Pass it to `.or(...)` on
 * the supabase-js query builder.
 *
 *   const scope = leadReadScopeWhere(user);
 *   let q = supabaseAdmin.from("crm_Leads").select("*");
 *   if (scope) q = q.or(scope);
 */
export const leadReadScopeWhere = (user: {
  id: string;
  role: string;
  tenantId?: string | null;
}): string => {
  if (user.role === "superadmin" || user.role === "admin") return "";

  const clauses: string[] = [`assigned_to.eq.${user.id}`];
  if (user.tenantId) {
    clauses.push(`tenantId.eq.${user.tenantId}`);
  }
  return clauses.join(",");
};
