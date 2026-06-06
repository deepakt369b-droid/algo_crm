"use server";
import { getSession } from "@/lib/auth-server";


import { inngest } from "@/inngest/client";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function requireSession() {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id as string;
}

export async function triggerSync(accountId: string) {
  const userId = await requireSession();

  const account = (await supabaseAdmin.from("EmailAccount").select("id").eq("id", accountId).eq("userId", userId).single()).data;
  if (!account) throw new Error("Account not found");

  await inngest.send({ name: "email/sync-account", data: { accountId } });
}
