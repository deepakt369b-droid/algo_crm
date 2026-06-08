import { ReactNode } from "react";

/**
 * Root layout required by Next.js.
 *
 * The actual HTML structure and providers live in app/[locale]/layout.tsx.
 * This minimal root layout exists because there is a root app/page.tsx
 * (which redirects to the default locale).
 */
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
