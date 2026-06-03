
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceSettingsForm } from "./_components/InvoiceSettingsForm";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function InvoiceSettingsPage() {
  const [settings, currencies, series, taxRates] = await Promise.all([
    (await supabaseAdmin.from("invoice_Settings").select("*").single()).data,
    (await supabaseAdmin.from("currency").select("*").eq("isEnabled", true).order("code", { ascending: true })).data,
    (await supabaseAdmin.from("invoice_Series").select("*").eq("active", true).order("name", { ascending: true })).data,
    (await supabaseAdmin.from("invoice_TaxRates").select("*").eq("active", true).order("rate", { ascending: false })).data,
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invoice Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceSettingsForm
            settings={settings ? JSON.parse(JSON.stringify(settings)) : null}
            currencies={JSON.parse(JSON.stringify(currencies))}
            series={JSON.parse(JSON.stringify(series))}
            taxRates={JSON.parse(JSON.stringify(taxRates))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
