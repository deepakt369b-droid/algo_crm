import { industryTemplates } from "./definitions";

export async function applyTemplateToTenant(tenantId: string, templateSlug: string) {
  const template = industryTemplates.find((t) => t.slug === templateSlug);
  
  if (!template) {
    throw new Error(`Template not found: ${templateSlug}`);
  }

  // Logic to apply the template:
  // 1. Update the Tenant record in Convex with customCrmConfig, enabledModules, customFields
  // 2. Pre-fill any sample data required by the template
  // 3. Set up WhatsApp template configurations

  console.log(`Applying template ${template.name} to tenant ${tenantId}`);
  
  // Return the applied config
  return {
    success: true,
    enabledModules: template.enabledModules,
    crmCustomFields: template.crmCustomFields,
    whatsappTemplates: template.whatsappTemplates,
  };
}
