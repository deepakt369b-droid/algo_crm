"use server";

import { revalidatePath } from "next/cache";

export async function getSubscriptions() {
  const subscriptions = (await supabaseAdmin.from("crm_Tenant_Subscriptions").select("*").order("createdAt", { ascending: false })).data;

  return subscriptions.map((sub) => ({
    id: sub.id,
    tenantId: sub.tenantId,
    tenantName: sub.tenantId,
    tenantSlug: sub.tenantId,
    plan: sub.planName.toLowerCase(),
    status: sub.status.toLowerCase(),
    amount: sub.planName.toLowerCase() === "premium" ? 99 : sub.planName.toLowerCase() === "pro" ? 49 : 0,
    currency: "USD",
    billingCycle: sub.billingCycle.toLowerCase(),
    currentPeriodEnd: sub.endDate ? sub.endDate.getTime() : new Date().getTime() + 30 * 24 * 60 * 60 * 1000,
    stripeSubscriptionId: sub.stripeSubscriptionId || "",
  }));
}

export async function createSubscription(data: any) {
  const subscription = (await supabaseAdmin.from("crm_Tenant_Subscriptions").insert({
        tenantId: data.tenantId,
        planName: data.plan.toUpperCase(),
        status: data.status.toUpperCase(),
        billingCycle: "MONTHLY",
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      }).select("*").single()).data;
  revalidatePath("/superadmin/subscriptions");
  return subscription;
}

export async function updateSubscription(data: { id: string; plan?: string; status?: string }) {
  const subscription = (await supabaseAdmin.from("crm_Tenant_Subscriptions").update({
        ...(data.plan ? { planName: data.plan.toUpperCase() } : {}),
        ...(data.status ? { status: data.status.toUpperCase() } : {}),
      }).eq("id", data.id).select("*").single()).data;
  revalidatePath("/superadmin/subscriptions");
  return subscription;
}

export async function deleteSubscription(data: { id: string }) {
  (await supabaseAdmin.from("crm_Tenant_Subscriptions").delete().eq("id", data.id).select("*").single()).data;
  revalidatePath("/superadmin/subscriptions");
  return { success: true };
}
