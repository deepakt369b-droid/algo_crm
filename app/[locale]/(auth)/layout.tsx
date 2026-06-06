import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

import "@/app/[locale]/globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";
import Footer from "@/app/[locale]/(routes)/components/Footer";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const { locale } = params;

  const t = await getTranslations({ locale, namespace: "RootLayout" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full bg-background relative overflow-hidden bg-grid-pattern">
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-primary/10 dark:bg-primary/5 blur-[80px] pointer-events-none animate-pulse-glow" />
      
      <div className="absolute top-6 right-6 left-6 flex justify-between items-center z-50">
        <Link
          href="/"
          className="flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-all duration-200 hover:-translate-x-0.5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to website
        </Link>
        <ThemeToggle />
      </div>
      <div className="flex items-center justify-center grow h-full w-full max-w-[1280px] px-6 py-20 z-10">
        {children}
      </div>
      <div className="w-full mt-auto py-4 z-10 flex justify-center border-t border-border/10 bg-background/30 backdrop-blur-sm">
        <Footer />
      </div>
    </div>
  );
};

export default AuthLayout;
