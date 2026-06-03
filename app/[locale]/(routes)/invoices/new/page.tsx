import Container from "@/app/[locale]/(routes)/components/ui/Container";
import { getTranslations } from "next-intl/server";

import { InvoiceForm } from "../components/invoice-form";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function NewInvoicePage() {
  const t = await getTranslations("InvoicesPage");

  const [products, taxRates, series, currencies, settings] =
    await Promise.all([
      (await supabaseAdmin.from("crm_Products").select("id, name").eq("status", "ACTIVE").order("name", { ascending: true })).data,
      (await supabaseAdmin.from("invoice_TaxRates").select("*").eq("active", true).order("rate", { ascending: false })).data,
      (await supabaseAdmin.from("invoice_Series").select("*").eq("active", true).order("name", { ascending: true })).data,
      (await supabaseAdmin.from("currency").select("*").eq("isEnabled", true).order("code", { ascending: true })).data,
      (await supabaseAdmin.from("invoice_Settings").select("*").single()).data,
    ]);

  const formLabels = {
    type: t("form.type"),
    account: t("form.account"),
    currency: t("form.currency"),
    series: t("form.series"),
    dueDate: t("form.dueDate"),
    lineItems: t("form.lineItems"),
    addLine: t("form.addLine"),
    product: t("form.product"),
    description: t("form.description"),
    quantity: t("form.quantity"),
    unitPrice: t("form.unitPrice"),
    discount: t("form.discount"),
    taxRate: t("form.taxRate"),
    total: t("form.total"),
    publicNotes: t("form.publicNotes"),
    internalNotes: t("form.internalNotes"),
    save: t("form.save"),
    bankName: t("form.bankName"),
    iban: t("form.iban"),
    swift: t("form.swift"),
    variableSymbol: t("form.variableSymbol"),
  };

  return (
    <Container title={t("new")} description={t("description")}>
      <InvoiceForm
        products={JSON.parse(JSON.stringify(products))}
        taxRates={JSON.parse(JSON.stringify(taxRates))}
        series={JSON.parse(JSON.stringify(series))}
        currencies={JSON.parse(JSON.stringify(currencies))}
        settings={settings ? JSON.parse(JSON.stringify(settings)) : null}
        labels={formLabels}
      />
    </Container>
  );
}
