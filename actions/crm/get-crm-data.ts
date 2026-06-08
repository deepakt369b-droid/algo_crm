import { cache } from "react";
import { unstable_cache } from "next/cache";

import { serializeDecimalsList } from "@/lib/serialize-decimals";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getAllCrmData = cache(
  unstable_cache(
    async () => {
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
        (await supabaseAdmin.from("crm_Accounts").select("*").is("deletedAt", null)).data,
        (await supabaseAdmin.from("crm_Opportunities").select("*").is("deletedAt", null)).data,
        (await supabaseAdmin.from("crm_Leads").select("*").is("deletedAt", null)).data,
        (await supabaseAdmin.from("crm_Contacts").select("*").is("deletedAt", null)).data,
        (await supabaseAdmin.from("crm_Contracts").select("*").is("deletedAt", null)).data,
        (await supabaseAdmin.from("crm_Opportunities_Type").select("*")).data,
        (await supabaseAdmin.from("crm_Opportunities_Sales_Stages").select("*")).data,
        (await supabaseAdmin.from("crm_campaigns").select("*").is("deletedAt", null)).data,
        (await supabaseAdmin.from("crm_Industry_Type").select("*")).data,
        (await supabaseAdmin.from("crm_Contact_Types").select("*").order("name", { ascending: true })).data,
        (await supabaseAdmin.from("crm_Lead_Sources").select("*").order("name", { ascending: true })).data,
        (await supabaseAdmin.from("crm_Lead_Statuses").select("*").order("name", { ascending: true })).data,
        (await supabaseAdmin.from("crm_Lead_Types").select("*").order("name", { ascending: true })).data,
        (await supabaseAdmin.from("Currency").select("*").eq("isEnabled", true).order("code", { ascending: true })).data,
        (await supabaseAdmin.from("ExchangeRate").select("*")).data,
        (await supabaseAdmin.from("crm_ProductCategories").select("*").eq("isActive", true).order("order", { ascending: true })).data,
      ]);

      const data = {
        accounts: accounts ?? [],
        opportunities: serializeDecimalsList(opportunities ?? []),
        leads: leads ?? [],
        contacts: contacts ?? [],
        contracts: serializeDecimalsList(contracts ?? []),
        saleTypes: saleTypes ?? [],
        saleStages: saleStages ?? [],
        campaigns: campaigns ?? [],
        industries: industries ?? [],
        contactTypes: contactTypes ?? [],
        leadSources: leadSources ?? [],
        leadStatuses: leadStatuses ?? [],
        leadTypes: leadTypes ?? [],
        currencies: currencies ?? [],
        productCategories: productCategories ?? [],
        exchangeRates: (exchangeRates ?? []).map((r: { fromCurrency: string; toCurrency: string; rate: unknown }) => ({
          fromCurrency: r.fromCurrency,
          toCurrency: r.toCurrency,
          rate: Number(r.rate),
        })),
      };

      return data;
    },
    ["crm-data"],
    { tags: ["crm-data"], revalidate: 300 }
  )
);
