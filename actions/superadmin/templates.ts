"use server";

import { revalidatePath } from "next/cache";

export async function getTemplates() {
  const templates = await supabaseAdmin.from("crm_Industry_Templates").findMany({
    orderBy: { createdAt: "desc" },
  });
  return templates;
}

export async function createTemplate(data: any) {
  const template = await supabaseAdmin.from("crm_Industry_Templates").insert({
    data: {
      name: data.name,
      slug: data.slug,
      industry: data.industry,
      description: data.description,
      icon: data.icon,
      features: data.features || [],
      crmCustomFields: data.crmCustomFields || [],
      whatsappTemplates: data.whatsappTemplates || [],
      isActive: true,
    },
  });
  revalidatePath("/superadmin/templates");
  return template;
}

export async function updateTemplate(data: any) {
  const { id, ...updateData } = data;
  const template = await supabaseAdmin.from("crm_Industry_Templates").update({
    where: { id },
    data: updateData,
  });
  revalidatePath("/superadmin/templates");
  return template;
}

export async function updateTemplateStatus(data: { id: string; isActive: boolean }) {
  const template = await supabaseAdmin.from("crm_Industry_Templates").update({
    where: { id: data.id },
    data: { isActive: data.isActive },
  });
  revalidatePath("/superadmin/templates");
  return template;
}

export async function deleteTemplate(data: { id: string }) {
  await supabaseAdmin.from("crm_Industry_Templates").delete({
    where: { id: data.id },
  });
  revalidatePath("/superadmin/templates");
  return { success: true };
}

export async function seedTemplates(data: { templates: any[] }) {
  const count = await supabaseAdmin.from("crm_Industry_Templates").count();
  if (count > 0) return { success: true };

  for (const t of data.templates) {
    await supabaseAdmin.from("crm_Industry_Templates").upsert({
      where: { slug: t.slug },
      update: {},
      create: {
        name: t.name,
        slug: t.slug,
        industry: t.industry,
        description: t.description,
        icon: t.icon,
        features: t.features || [],
        crmCustomFields: t.crmCustomFields || [],
        whatsappTemplates: t.whatsappTemplates || [],
        isActive: true,
      },
    });
  }
  revalidatePath("/superadmin/templates");
  return { success: true };
}
