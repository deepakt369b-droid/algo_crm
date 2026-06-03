import { PrismaClient, ExchangeRateSource } from "@/lib/prisma-types";

const currencies = [
  { code: "EUR", name: "Euro", symbol: "€", isEnabled: true, isDefault: true },
  { code: "USD", name: "US Dollar", symbol: "$", isEnabled: true, isDefault: false },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč", isEnabled: true, isDefault: false },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", isEnabled: true, isDefault: false },
  { code: "SAR", name: "Saudi Riyal", symbol: "ر.س", isEnabled: true, isDefault: false },
  { code: "QAR", name: "Qatari Riyal", symbol: "ر.ق", isEnabled: true, isDefault: false },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك", isEnabled: true, isDefault: false },
  { code: "BHD", name: "Bahraini Dinar", symbol: "د.ب", isEnabled: true, isDefault: false },
  { code: "OMR", name: "Omani Rial", symbol: "ر.ع", isEnabled: true, isDefault: false },
];

const rates = [
  { fromCurrency: "EUR", toCurrency: "USD", rate: 1.084, source: ExchangeRateSource.ECB },
  { fromCurrency: "EUR", toCurrency: "CZK", rate: 25.315, source: ExchangeRateSource.ECB },
  { fromCurrency: "USD", toCurrency: "EUR", rate: 0.92251, source: ExchangeRateSource.ECB },
  { fromCurrency: "USD", toCurrency: "CZK", rate: 23.35, source: ExchangeRateSource.ECB },
  { fromCurrency: "CZK", toCurrency: "EUR", rate: 0.0395, source: ExchangeRateSource.ECB },
  { fromCurrency: "CZK", toCurrency: "USD", rate: 0.04283, source: ExchangeRateSource.ECB },
  
  // USD -> GCC Pegs
  { fromCurrency: "USD", toCurrency: "AED", rate: 3.6725, source: ExchangeRateSource.ECB },
  { fromCurrency: "USD", toCurrency: "SAR", rate: 3.75, source: ExchangeRateSource.ECB },
  { fromCurrency: "USD", toCurrency: "QAR", rate: 3.64, source: ExchangeRateSource.ECB },
  { fromCurrency: "USD", toCurrency: "KWD", rate: 0.307, source: ExchangeRateSource.ECB },
  { fromCurrency: "USD", toCurrency: "BHD", rate: 0.376, source: ExchangeRateSource.ECB },
  { fromCurrency: "USD", toCurrency: "OMR", rate: 0.385, source: ExchangeRateSource.ECB },

  // GCC -> USD Reciprocals
  { fromCurrency: "AED", toCurrency: "USD", rate: 0.27229, source: ExchangeRateSource.ECB },
  { fromCurrency: "SAR", toCurrency: "USD", rate: 0.26667, source: ExchangeRateSource.ECB },
  { fromCurrency: "QAR", toCurrency: "USD", rate: 0.27473, source: ExchangeRateSource.ECB },
  { fromCurrency: "KWD", toCurrency: "USD", rate: 3.2573, source: ExchangeRateSource.ECB },
  { fromCurrency: "BHD", toCurrency: "USD", rate: 2.6596, source: ExchangeRateSource.ECB },
  { fromCurrency: "OMR", toCurrency: "USD", rate: 2.5974, source: ExchangeRateSource.ECB },

  // EUR -> GCC Conversions
  { fromCurrency: "EUR", toCurrency: "AED", rate: 3.98099, source: ExchangeRateSource.ECB },
  { fromCurrency: "EUR", toCurrency: "SAR", rate: 4.065, source: ExchangeRateSource.ECB },
  { fromCurrency: "EUR", toCurrency: "QAR", rate: 3.94576, source: ExchangeRateSource.ECB },
  { fromCurrency: "EUR", toCurrency: "KWD", rate: 0.33279, source: ExchangeRateSource.ECB },
  { fromCurrency: "EUR", toCurrency: "BHD", rate: 0.40758, source: ExchangeRateSource.ECB },
  { fromCurrency: "EUR", toCurrency: "OMR", rate: 0.41734, source: ExchangeRateSource.ECB },

  // GCC -> EUR Reciprocals
  { fromCurrency: "AED", toCurrency: "EUR", rate: 0.2512, source: ExchangeRateSource.ECB },
  { fromCurrency: "SAR", toCurrency: "EUR", rate: 0.246, source: ExchangeRateSource.ECB },
  { fromCurrency: "QAR", toCurrency: "EUR", rate: 0.2534, source: ExchangeRateSource.ECB },
  { fromCurrency: "KWD", toCurrency: "EUR", rate: 3.0049, source: ExchangeRateSource.ECB },
  { fromCurrency: "BHD", toCurrency: "EUR", rate: 2.4535, source: ExchangeRateSource.ECB },
  { fromCurrency: "OMR", toCurrency: "EUR", rate: 2.3961, source: ExchangeRateSource.ECB },
];

export async function seedCurrencies(prisma: PrismaClient) {
  console.log("Seeding currencies...");

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: { name: currency.name, symbol: currency.symbol },
      create: currency,
    });
  }

  for (const rate of rates) {
    await prisma.exchangeRate.upsert({
      where: {
        fromCurrency_toCurrency: {
          fromCurrency: rate.fromCurrency,
          toCurrency: rate.toCurrency,
        },
      },
      update: { rate: rate.rate, source: rate.source },
      create: rate,
    });
  }

  await prisma.crm_SystemSettings.upsert({
    where: { key: "ecb_auto_update" },
    update: {},
    create: { key: "ecb_auto_update", value: "false" },
  });

  await prisma.crm_SystemSettings.upsert({
    where: { key: "default_currency" },
    update: {},
    create: { key: "default_currency", value: "EUR" },
  });

  console.log("Currencies seeded.");
}
