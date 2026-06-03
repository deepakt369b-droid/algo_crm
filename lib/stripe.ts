// Lazy/dynamic Stripe loader. We avoid importing `stripe` at module load time so
// the application can run without the Stripe package installed during a
// Supabase-only migration. Callers can use `getStripe()` to obtain the real
// instance (async) or use the exported `stripe` stub which throws when used.

export const stripe: any = new Proxy({}, {
  get() {
    throw new Error("Stripe package is not installed or configured. Use getStripe() to dynamically load Stripe or install 'stripe' and set STRIPE_SECRET_KEY.");
  },
});

export async function getStripe() {
  try {
    const mod = await import("stripe");
    const Stripe = (mod as any).default ?? mod;
    return new Stripe(process.env.STRIPE_SECRET_KEY || "dummy", {
      apiVersion: "2024-11-20.acacia",
      appInfo: { name: "Flowline Pro", version: "0.1.0" },
    });
  } catch (err) {
    throw new Error("Stripe package is not installed. Install 'stripe' to enable payments.");
  }
}
