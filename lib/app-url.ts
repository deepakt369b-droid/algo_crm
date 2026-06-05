const DEFAULT_PUBLIC_APP_URL = "https://algo-crm-three.vercel.app";

export function getPublicAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || DEFAULT_PUBLIC_APP_URL).replace(/\/+$/, "");
}

export function getAuthCallbackUrl(nextPath: string) {
  const callbackUrl = new URL("/auth/callback", getPublicAppUrl());
  callbackUrl.searchParams.set("next", nextPath);
  return callbackUrl.toString();
}
