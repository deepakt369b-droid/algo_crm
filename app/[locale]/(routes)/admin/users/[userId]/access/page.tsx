import React from "react";
import Container from "@/app/[locale]/(routes)/components/ui/Container";
import { UserAccessClient } from "./UserAccessClient";

import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface AccessPageProps {
  params: {
    userId: string;
    locale: string;
  };
}

export default async function UserAccessPage({ params }: AccessPageProps) {
  const { userId } = await params;
  
  const user = (await supabaseAdmin.from("users").select("id, name, email, accessibleTabs").eq("id", userId).single()).data;

  if (!user) {
    return notFound();
  }

  const initialTabs = user.accessibleTabs || [];

  return (
    <Container
      title={`Access Control`}
      description={`Manage module access for ${user.name || user.email}`}
    >
      <UserAccessClient 
        userId={user.id} 
        userName={user.name || user.email || "Unknown User"} 
        initialTabs={initialTabs} 
      />
    </Container>
  );
}
