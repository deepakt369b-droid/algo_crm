
import { getExchangeRates, convertAmount } from "@/lib/currency";
import Decimal from "decimal.js";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getExpectedRevenue = async (displayCurrency: string) => {
  const activeOpportunities = (await supabaseAdmin.from("crm_Opportunities").select("budget, currency").eq("status", "ACTIVE").is("deletedAt", null)).data ?? [];

  const rates = await getExchangeRates();

  let total = new Decimal(0);
  for (const opp of activeOpportunities) {
    const budget = new Decimal(opp.budget?.toString() ?? "0");
    const from = opp.currency || displayCurrency;
    const converted = convertAmount(budget, from, displayCurrency, rates);
    total = total.add(converted ?? budget);
  }

  return total.toNumber();
};
