import React, { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="Flowline Pro"
              width={180}
              height={90}
              priority
              loading="eager"
              className="h-10 w-auto object-contain"
            />
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
            <Link href="#templates" className="text-sm font-medium hover:text-primary transition-colors">Templates</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/sign-in" className="text-sm font-medium hover:text-primary transition-colors">
              Log in
            </Link>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t bg-muted/40 py-12">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 space-y-4">
            <Image
              src="/logo.png"
              alt="Flowline Pro"
              width={190}
              height={95}
              className="h-11 w-auto object-contain"
            />
            <p className="text-sm text-muted-foreground max-w-xs">
              The ultimate multi-tenant CRM for growing businesses. Choose your industry template and scale instantly.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/sign-up" className="text-sm text-muted-foreground hover:text-primary transition-colors">Sign Up</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
