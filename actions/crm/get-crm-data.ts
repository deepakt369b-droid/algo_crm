import { cache } from "react";

import { serializeDecimalsList } from "@/lib/serialize-decimals";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getAllCrmData = cache(async () => {
  const [
    accounts,
    opportunities,
    leads,
    contacts,
    contracts,
    saleTypes,
    saleStages,
    campaigns,
    industries,
    contactTypes,
    leadSources,
    leadStatuses,
    leadTypes,
    currencies,
    exchangeRates,
    productCategories,
  ] = await Promise.all([
    (await supabaseAdmin.from("crm_Accounts").select("*").eq("deletedAt", null)).data,
    (await supabaseAdmin.from("crm_Opportunities").select("*").eq("deletedAt", null)).data,
    (await supabaseAdmin.from("crm_Leads").select("*").eq("deletedAt", null)).data,
    (await supabaseAdmin.from("crm_Contacts").select("*").eq("deletedAt", null)).data,
    (await supabaseAdmin.from("crm_Contracts").select("*").eq("deletedAt", null)).data,
    (await supabaseAdmin.from("crm_Opportunities_Type").select("*")).data,
    (await supabaseAdmin.from("crm_Opportunities_Sales_Stages").select("*")).data,
    (await supabaseAdmin.from("crm_campaigns").select("*").eq("deletedAt", null)).data,
    (await supabaseAdmin.from("crm_Industry_Type").select("*")).data,
    (await supabaseAdmin.from("crm_Contact_Types").select("*").order("name", { ascending: true })).data,
    (await supabaseAdmin.from("crm_Lead_Sources").select("*").order("name", { ascending: true })).data,
    (await supabaseAdmin.from("crm_Lead_Statuses").select("*").order("name", { ascending: true })).data,
    (await supabaseAdmin.from("crm_Lead_Types").select("*").order("name", { ascending: true })).data,
    (await supabaseAdmin.from("currency").select("*").eq("isEnabled", true).order("code", { ascending: true })).data,
    (await supabaseAdmin.from("exchangeRate").select("*")).data,
    (await supabaseAdmin.from("crm_ProductCategories").select("*").eq("isActive", true).order("order", { ascending: true })).data,
  ]);

  const data = {
    accounts,
    opportunities: serializeDecimalsList(opportunities),
    leads,
    contacts,
    contracts: serializeDecimalsList(contracts),
    saleTypes,
    saleStages,
    campaigns,
    industries,
    contactTypes,
    leadSources,
    leadStatuses,
    leadTypes,
    currencies,
    productCategories,
    exchangeRates: exchangeRates.map((r: { fromCurrency: string; toCurrency: string; rate: unknown }) => ({
      fromCurrency: r.fromCurrency,
      toCurrency: r.toCurrency,
      rate: Number(r.rate),
    })),
  };

  return data;
});
