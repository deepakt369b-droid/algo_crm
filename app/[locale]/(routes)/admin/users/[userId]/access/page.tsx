import React from "react";
import Container from "@/app/[locale]/(routes)/components/ui/Container";
import { UserAccessClient } from "./UserAccessClient";
import { prismadb } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface AccessPageProps {
  params: {
    userId: string;
    locale: string;
  };
}

export default async function UserAccessPage({ params }: AccessPageProps) {
  const { userId } = await params;
  
  const user = await prismadb.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      accessibleTabs: true,
    },
  });

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
