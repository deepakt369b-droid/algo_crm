import { Decimal } from "decimal.js";

export async function fetchFxRate(from: string, to: string, on?: Date): Promise<Decimal> {
  if (from === to) return new Decimal(1);
  try {
    const date = on ? on.toISOString().slice(0, 10) : "latest";
    const url = `https://api.frankfurter.app/${date}?from=${from}&to=${to}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`FX fetch failed: ${res.status}`);
    const json = (await res.json()) as { rates: Record<string, number> };
    const rate = json.rates[to];
    if (rate == null) throw new Error(`FX rate ${from}->${to} not found`);
    return new Decimal(rate);
  } catch (err) {
    console.warn(`[FX] Failed to fetch rate ${from}->${to}, falling back to 1:`, err);
    return new Decimal(1);
  }
}
