"use server";
"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";


export async function getTemplates() {
  const templates = (await supabaseAdmin.from("crm_Industry_Templates").select("*").order("createdAt", { ascending: false })).data;
  return templates ?? [];
}

export async function createTemplate(data: any) {
  const template = (await supabaseAdmin.from("crm_Industry_Templates").insert({
        name: data.name,
        slug: data.slug,
        industry: data.industry,
        description: data.description,
        icon: data.icon,
        features: data.features || [],
        crmCustomFields: data.crmCustomFields || [],
        whatsappTemplates: data.whatsappTemplates || [],
        isActive: true,
      }).select("*").single()).data;
  revalidatePath("/superadmin/templates");
  return template;
}

export async function updateTemplate(data: any) {
  const { id, ...updateData } = data;
  const template = (await supabaseAdmin.from("crm_Industry_Templates").update(updateData).select("*").single()).data;
  revalidatePath("/superadmin/templates");
  return template;
}

export async function updateTemplateStatus(data: { id: string; isActive: boolean }) {
  const template = (await supabaseAdmin.from("crm_Industry_Templates").update({ isActive: data.isActive }).eq("id", data.id).select("*").single()).data;
  revalidatePath("/superadmin/templates");
  return template;
}

export async function deleteTemplate(data: { id: string }) {
  (await supabaseAdmin.from("crm_Industry_Templates").delete().eq("id", data.id).select("*").single()).data;
  revalidatePath("/superadmin/templates");
  return { success: true };
}

export async function seedTemplates(data: { templates: any[] }) {
  const count = (await supabaseAdmin.from("crm_Industry_Templates").select("*", { count: 'exact', head: true })).count;
  if ((count ?? 0) > 0) return { success: true };

  for (const t of data.templates) {
    await supabaseAdmin.from("crm_Industry_Templates").upsert({
      name: t.name,
      slug: t.slug,
      industry: t.industry,
      description: t.description,
      icon: t.icon,
      features: t.features || [],
      crmCustomFields: t.crmCustomFields || [],
      whatsappTemplates: t.whatsappTemplates || [],
      isActive: true,
    }, { onConflict: 'slug' });
  }
  revalidatePath("/superadmin/templates");
  return { success: true };
}
