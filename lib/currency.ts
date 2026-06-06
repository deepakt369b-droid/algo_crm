import Decimal from "decimal.js";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Re-export pure functions so existing server-side imports still work
export { findRate, convertAmount, formatCurrency } from "@/lib/currency-format";
export type { Rate } from "@/lib/currency-format";

export async function getExchangeRates() {
  const { data: rates, error } = await supabaseAdmin.from("ExchangeRate").select("*");
  if (error || !rates) return [];

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
  const rate = (await supabaseAdmin.from("ExchangeRate").select("*").single()).data;
  return rate ? rate.rate : null;
}

export async function getDefaultCurrency(): Promise<string> {
  const { data: setting } = await supabaseAdmin
    .from("crm_SystemSettings")
    .select("*")
    .eq("key", "default_currency")
    .maybeSingle();

  return setting?.value || "EUR";
}

export async function getEnabledCurrencies() {
  const { data: currencies, error } = await supabaseAdmin
    .from("Currency")
    .select("*")
    .eq("isEnabled", true)
    .order("code", { ascending: true });

  if (!error && currencies && currencies.length > 0) return currencies;

  return [{ code: "EUR", name: "Euro", symbol: "EUR" }];
}
