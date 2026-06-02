import React from "react";
import { getTemplates } from "@/actions/superadmin/templates";
import TemplatesManager from "./_components/TemplatesManager";

export default async function SuperAdminTemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          CRM Industry Blueprints
        </h2>
        <p className="text-muted-foreground mt-1">
          Create, edit, toggle, or utilize AI to draft tailored database templates for new workspace provisions.
        </p>
      </div>
      <TemplatesManager initialTemplates={templates} />
    </div>
  );
}
