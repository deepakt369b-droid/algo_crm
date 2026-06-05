const DEFAULT_PUBLIC_APP_URL = "https://algo-crm-three.vercel.app";
const PRODUCTION_VERCEL_HOST = "algo-crm-three.vercel.app";

export function getPublicAppUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || DEFAULT_PUBLIC_APP_URL;

  try {
    const url = new URL(configuredUrl);
    const isVercelPreviewUrl =
      url.hostname.endsWith(".vercel.app") &&
      url.hostname !== PRODUCTION_VERCEL_HOST;

    if (isVercelPreviewUrl) {
      return DEFAULT_PUBLIC_APP_URL;
    }
  } catch {
    return DEFAULT_PUBLIC_APP_URL;
  }

  return configuredUrl.replace(/\/+$/, "");
}

export function getAuthCallbackUrl(nextPath: string) {
  const callbackUrl = new URL("/auth/callback", getPublicAppUrl());
  callbackUrl.searchParams.set("next", nextPath);
  return callbackUrl.toString();
}
