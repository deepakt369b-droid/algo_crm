
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaxRatesTable } from "./_components/TaxRatesTable";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function TaxRatesPage() {
  const rates = (await supabaseAdmin.from("Invoice_TaxRates").select("*").order("rate", { ascending: false })).data;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tax Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <TaxRatesTable rates={JSON.parse(JSON.stringify(rates))} />
        </CardContent>
      </Card>
    </div>
  );
}
