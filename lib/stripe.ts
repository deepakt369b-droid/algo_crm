const importOptionalModule = async <T = any>(pkg: string): Promise<T | null> => {
  try {
    return (await eval("import(pkg)") as Promise<T>);
  } catch {
    return null;
  }
};

export async function getStripe() {
  const stripeModule = await importOptionalModule<typeof import("stripe")>("stripe");
  const StripeClass = stripeModule?.default ?? stripeModule;

  if (!StripeClass) {
    throw new Error(
      "stripe is not installed. Install stripe or disable Stripe features to continue."
    );
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured in the environment.");
  }

  return new StripeClass(secretKey, {
    apiVersion: "2024-11-20.acacia", // Use the latest API version or your preferred one
    appInfo: {
      name: "Flowline Pro",
      version: "0.1.0",
    },
  });
}
