"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Globe, Check, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addLanguage } from "@/actions/languages/add-language";
import { useRouter } from "next/navigation";

interface LanguageSettingsTabProps {
  initialLocales: string[];
}

const LANGUAGE_METADATA: Record<string, { name: string; flag: string }> = {
  en: { name: "English", flag: "🇺🇸" },
  ar: { name: "Arabic (العربية)", flag: "🇸🇦" },
  cz: { name: "Czech (Čeština)", flag: "🇨🇿" },
  de: { name: "German (Deutsch)", flag: "🇩🇪" },
  uk: { name: "Ukrainian (Українська)", flag: "🇺🇦" },
  fr: { name: "French (Français)", flag: "🇫🇷" },
  es: { name: "Spanish (Español)", flag: "🇪🇸" },
  it: { name: "Italian (Italiano)", flag: "🇮🇹" },
  pt: { name: "Portuguese (Português)", flag: "🇵🇹" },
  tr: { name: "Turkish (Türkçe)", flag: "🇹🇷" },
  zh: { name: "Chinese (中文)", flag: "🇨🇳" },
  ja: { name: "Japanese (日本語)", flag: "🇯🇵" },
  ru: { name: "Russian (Русский)", flag: "🇷🇺" },
};

export default function LanguageSettingsTab({ initialLocales }: LanguageSettingsTabProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const handleAddLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (code.length !== 2) {
      toast.error("Language code must be exactly 2 characters (e.g. 'fr', 'es').");
      return;
    }

    startTransition(async () => {
      try {
        const result = await addLanguage(code, name);
        if (result.success) {
          toast.success(result.message);
          setIsOpen(false);
          setCode("");
          setName("");
          router.refresh();
        } else {
          toast.error(result.error || result.message);
        }
      } catch (err) {
        toast.error("An unexpected error occurred.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="wa-card overflow-hidden border border-border/40 relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-purple-600 dark:to-teal-400" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">Active Languages</CardTitle>
            <CardDescription className="text-xs">
              Manage internationalization, default locales, and register new translations for the SaaS.
            </CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl h-10 px-4 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/95 hover:to-purple-600/95 text-white gap-2 shadow-md shadow-primary/10">
                <Plus className="w-4 h-4" />
                Add Language
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl glass-card border border-border/40 max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 dark:to-teal-400 bg-clip-text text-transparent">
                  Add New Language
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Create a new translation locale file and register it globally in next-intl routing.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddLanguage} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="lang-code" className="text-xs font-semibold">Language Code (ISO 2-letter)</Label>
                  <Input
                    id="lang-code"
                    maxLength={2}
                    placeholder="e.g. es, fr, de"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toLowerCase())}
                    className="rounded-xl h-11 border-border/60"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lang-name" className="text-xs font-semibold">Language Name</Label>
                  <Input
                    id="lang-name"
                    placeholder="e.g. Spanish, French"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl h-11 border-border/60"
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl h-11"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="rounded-xl h-11 bg-primary text-white hover:bg-primary/95"
                  >
                    {isPending ? "Creating..." : "Register Language"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/40 divide-y divide-border/40 overflow-hidden bg-muted/10">
            {initialLocales.map((localeCode) => {
              const meta = LANGUAGE_METADATA[localeCode] || { name: localeCode.toUpperCase(), flag: "🌐" };
              return (
                <div key={localeCode} className="flex items-center justify-between p-4 bg-background dark:bg-slate-900/40 hover:bg-muted/20 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl select-none">{meta.flag}</span>
                    <div>
                      <p className="font-semibold text-sm leading-none">{meta.name}</p>
                      <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mt-1">{localeCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
