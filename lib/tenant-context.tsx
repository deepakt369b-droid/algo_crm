"use client";

import React, { createContext, useContext, ReactNode } from "react";

interface TenantContextType {
  tenantId: string | null;
  tenantName: string | null;
  industry: string | null;
  templateId: string | null;
  plan: string | null;
  features: string[];
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType>({
  tenantId: null,
  tenantName: null,
  industry: null,
  templateId: null,
  plan: null,
  features: [],
  isLoading: true,
});

export function TenantProvider({ 
  children, 
  tenantSlug 
}: { 
  children: ReactNode;
  tenantSlug?: string;
}) {
  // TODO: Fetch tenant from Supabase/Prisma instead of Convex.
  // For now, providing a default initialized state to prevent compilation crashes.
  const value = React.useMemo(() => ({
    tenantId: tenantSlug || null,
    tenantName: "Default Tenant",
    industry: null,
    templateId: null,
    plan: "Free",
    features: [],
    isLoading: false,
  }), [tenantSlug]);

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
