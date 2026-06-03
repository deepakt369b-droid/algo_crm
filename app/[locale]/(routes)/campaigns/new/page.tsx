import { WizardShell } from "./components/WizardShell";
import { getTemplates } from "@/actions/campaigns/templates/get-templates";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function NewCampaignPage() {
  const [templates, targetLists] = await Promise.all([
    getTemplates(),
    (await supabaseAdmin.from("crm_TargetLists").select("*, _count(targets)").eq("status", true).order("name", { ascending: true })).data,
  ]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">New Campaign</h1>
        <p className="text-muted-foreground">Create an email campaign</p>
      </div>
      <WizardShell templates={templates} targetLists={targetLists} />
    </div>
  );
}
