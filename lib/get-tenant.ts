import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getTenantId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.tenantId) {
    return null;
  }

  return session.user.tenantId;
}

export async function requireTenantId() {
  const tenantId = await getTenantId();
  
  if (!tenantId) {
    throw new Error("Tenant ID is required for this action");
  }

  return tenantId;
}
