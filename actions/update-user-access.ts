"use server";

import { prismadb } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";

export async function updateUserAccess(userId: string, accessibleTabs: string[]) {
  const session = await getSession();

  if (session?.user?.role !== "admin" && session?.user?.role !== "superadmin") {
    throw new Error("Unauthorized");
  }

  await prismadb.users.update({
    where: {
      id: userId,
    },
    data: {
      accessibleTabs,
    },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}/access`);
  return { success: true };
}
