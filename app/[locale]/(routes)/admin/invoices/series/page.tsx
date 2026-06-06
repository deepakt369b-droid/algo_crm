
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeriesTable } from "./_components/SeriesTable";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function InvoiceSeriesPage() {
  const series = (await supabaseAdmin.from("Invoice_Series").select("*").order("createdAt", { ascending: false })).data;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invoice Series</CardTitle>
        </CardHeader>
        <CardContent>
          <SeriesTable series={JSON.parse(JSON.stringify(series))} />
        </CardContent>
      </Card>
    </div>
  );
}
