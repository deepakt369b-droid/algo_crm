import Decimal from "decimal.js";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Re-export pure functions so existing server-side imports still work
export { findRate, convertAmount, formatCurrency } from "@/lib/currency-format";
export type { Rate } from "@/lib/currency-format";

export async function getExchangeRates() {
  const rates = (await supabaseAdmin.from("exchangeRate").select("*")).data;
  return rates.map((r: { fromCurrency: string; toCurrency: string; rate: Decimal }) => ({
    fromCurrency: r.fromCurrency,
    toCurrency: r.toCurrency,
    rate: r.rate,
  }));
}

export async function getSnapshotRate(
  from: string,
  to: string
): Promise<Decimal | null> {
  if (from === to) return new Decimal("1");
  const rate = (await supabaseAdmin.from("exchangeRate").select("*").single()).data;
  return rate ? rate.rate : null;
}

export async function getDefaultCurrency(): Promise<string> {
  const setting = (await supabaseAdmin.from("crm_SystemSettings").select("*").eq("key", "default_currency").single()).data;
  return setting?.value || "EUR";
}

export async function getEnabledCurrencies() {
  return (await supabaseAdmin.from("currency").select("*").eq("isEnabled", true).order("code", { ascending: true })).data;
}
