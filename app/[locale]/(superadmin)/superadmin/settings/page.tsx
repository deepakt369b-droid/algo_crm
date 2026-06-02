import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Settings, BrainCircuit, Globe } from "lucide-react";
import { getLocales } from "@/actions/languages/add-language";
import { getSystemSettings } from "@/actions/superadmin/system-settings";
import LanguageSettingsTab from "./_components/LanguageSettingsTab";
import SystemSettingsForm from "./_components/SystemSettingsForm";

export default async function SuperAdminSettingsPage() {
  const locales = await getLocales();
  const settings = await getSystemSettings();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">System Settings</h2>
        <p className="text-muted-foreground mt-1">
          Manage system configurations, global parameters, security guidelines, and third-party AI keys.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-4 w-[580px] mb-8 bg-muted/60 p-1 rounded-lg">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" />
            AI & Integrations
          </TabsTrigger>
          <TabsTrigger value="languages" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Languages
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6 focus-visible:outline-none">
          <SystemSettingsForm initialSettings={settings} activeTab="general" />
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6 focus-visible:outline-none">
          <SystemSettingsForm initialSettings={settings} activeTab="security" />
        </TabsContent>

        {/* AI & Integration Settings */}
        <TabsContent value="ai" className="space-y-6 focus-visible:outline-none">
          <SystemSettingsForm initialSettings={settings} activeTab="ai" />
        </TabsContent>

        {/* Languages Settings */}
        <TabsContent value="languages" className="space-y-6 focus-visible:outline-none">
          <LanguageSettingsTab initialLocales={locales} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
