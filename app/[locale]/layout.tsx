import "./globals.css";

import { DM_Sans, JetBrains_Mono, Noto_Sans_Arabic } from "next/font/google";

import { ReactNode } from "react";

import { NextIntlClientProvider } from "next-intl";
import { getTranslations, getMessages } from "next-intl/server";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { SWRProvider } from "@/app/providers/SWRProvider";
import Script from "next/script";
import { HydrationZapper } from "@/components/HydrationZapper";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const notoArabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-arabic" });

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;

  const { locale } = params;

  const t = await getTranslations({ locale, namespace: "RootLayout" });

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    title: t("title"),
    description: t("description"),
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.png", type: "image/png", sizes: "32x32" },
        { url: "/logo.png", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
    },
    openGraph: {
      images: [
        {
          url: "/images/opengraph-image.png",
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },
    twitter: {
      cardType: "summary_large_image",
      image: "/images/opengraph-image.png",
      width: 1200,
      height: 630,
      alt: t("title"),
    },
  };
}

export default async function RootLayout(props: Props) {
  const params = await props.params;

  const { locale } = params;

  const { children } = props;

  const messages = await getMessages();

  const isRtl = locale === "ar";

  return (
    <html lang={locale} dir={isRtl ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className={`${dmSans.variable} ${jetbrainsMono.variable} ${notoArabic.variable} font-sans min-h-screen antialiased bg-background text-foreground`} suppressHydrationWarning>
        <HydrationZapper />
        <Script
          id="strip-bis-skin-checked"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const removeAttribute = (el) => {
                  if (el.nodeType === 1) {
                    if (el.hasAttribute('bis_skin_checked')) el.removeAttribute('bis_skin_checked');
                    if (el.hasAttribute('bis_register')) el.removeAttribute('bis_register');
                    // Remove any attributes starting with __processed_
                    Array.from(el.attributes).forEach(attr => {
                      if (attr.name.startsWith('__processed_')) {
                        el.removeAttribute(attr.name);
                      }
                    });
                  }
                };
                const observer = new MutationObserver((mutations) => {
                  for (let i = 0; i < mutations.length; i++) {
                    const mutation = mutations[i];
                    if (mutation.type === 'attributes') {
                      if (mutation.attributeName === 'bis_skin_checked' || mutation.attributeName === 'bis_register' || mutation.attributeName.startsWith('__processed_')) {
                        removeAttribute(mutation.target);
                      }
                    } else if (mutation.type === 'childList') {
                      for (let j = 0; j < mutation.addedNodes.length; j++) {
                        const node = mutation.addedNodes[j];
                        if (node.nodeType === 1) {
                          removeAttribute(node);
                          const elements = node.querySelectorAll('[bis_skin_checked], [bis_register]');
                          for (let k = 0; k < elements.length; k++) {
                            removeAttribute(elements[k]);
                          }
                        }
                      }
                    }
                  }
                });
                
                // Immediate cleanup of any elements already injected
                const cleanup = () => {
                  const elements = document.querySelectorAll('[bis_skin_checked], [bis_register]');
                  for (let i = 0; i < elements.length; i++) removeAttribute(elements[i]);
                  removeAttribute(document.documentElement);
                  if (document.body) removeAttribute(document.body);
                  
                  // Also query for __processed_ attributes which querySelectorAll doesn't easily support generically
                  const allElements = document.getElementsByTagName('*');
                  for (let i = 0; i < allElements.length; i++) {
                    removeAttribute(allElements[i]);
                  }
                };
                
                cleanup();

                observer.observe(document.documentElement, {
                  childList: true,
                  subtree: true,
                  attributes: true,
                });
              })();
            `
          }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <SWRProvider>
              {children}
            </SWRProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
