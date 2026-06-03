"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { createColumns } from "../opportunities/table-components/columns";
import { NewOpportunityForm } from "../opportunities/components/NewOpportunityForm";
import { OpportunitiesDataTable } from "../opportunities/table-components/data-table";
import { OpportunitiesKanban } from "../opportunities/components/OpportunitiesKanban";

import type { getAllCrmData } from "@/actions/crm/get-crm-data";
import { useCurrency } from "@/context/currency-context";
import Decimal from "decimal.js";

type CrmData = Awaited<ReturnType<typeof getAllCrmData>>;

interface OpportunitiesViewProps {
  data: any[];
  crmData: CrmData;
  accountId?: string;
}

const OpportunitiesView = ({
  data,
  crmData,
  accountId,
}: OpportunitiesViewProps) => {
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const t = useTranslations("CrmPage");
  const { displayCurrency } = useCurrency();

  const { accounts, contacts, saleTypes, saleStages, campaigns, currencies, exchangeRates } = crmData;

  const rates = (exchangeRates ?? []).map((r: { fromCurrency: string; toCurrency: string; rate: unknown }) => ({
    fromCurrency: r.fromCurrency,
    toCurrency: r.toCurrency,
    rate: new Decimal(String(r.rate)),
  }));

  const opportunityColumns = createColumns({
    saleTypes,
    saleStages,
    campaigns,
    currencies: currencies.map((c: { code: string; name: string; symbol: string }) => ({ code: c.code, name: c.name, symbol: c.symbol })),
    displayCurrency,
    exchangeRates: rates,
  });

  // Pass all opportunities to Kanban (it handles filtering internally for ACTIVE vs INACTIVE/Lost)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>
              <Link href="/crm/opportunities" className="hover:underline">
                {t("opportunities.viewTitle")}
              </Link>
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {/* View Toggle */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "table" | "kanban")} className="mr-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="kanban">Kanban</TabsTrigger>
              </TabsList>
            </Tabs>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button className="my-2 cursor-pointer" aria-label={t("opportunities.addNew")} data-testid="add-opportunity-btn">+</Button>
              </SheetTrigger>
              <SheetContent className="w-full md:max-w-[771px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>{t("opportunities.sheetTitle")}</SheetTitle>
                  <SheetDescription>
                    {t("opportunities.sheetDescription")}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <NewOpportunityForm
                    accounts={accounts}
                    contacts={contacts}
                    salesType={saleTypes}
                    saleStages={saleStages}
                    campaigns={campaigns}
                    currencies={currencies.map((c) => ({ code: c.code, name: c.name, symbol: c.symbol }))}
                    accountId={accountId}
                    onDialogClose={() => setOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <Separator />
      </CardHeader>
      <CardContent className={viewMode === "kanban" ? "p-0 overflow-hidden" : ""}>
        {!data || data.length === 0 ? (
          t("opportunities.empty")
        ) : viewMode === "table" ? (
          <OpportunitiesDataTable data={data} columns={opportunityColumns} />
        ) : (
          <OpportunitiesKanban
            salesStages={saleStages}
            opportunities={data}
            crmData={crmData}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default OpportunitiesView;
