"use client";

import { useMemo, useState } from "react";
import { industryTemplates } from "@/lib/templates/definitions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Building,
  Briefcase,
  Stethoscope,
  Wrench,
  Car,
  Check,
  Layers,
  Settings2,
  MessageSquareCode,
  Hotel,
  Hammer,
  GraduationCap,
  Scale,
  Flame,
} from "lucide-react";

const icons = {
  Building,
  Briefcase,
  Stethoscope,
  Wrench,
  Car,
  Hotel,
  Hammer,
  GraduationCap,
  Scale,
  Flame,
};

const sectors = [
  "All",
  "Real Estate",
  "Healthcare",
  "Retail / Trading",
  "Automotive / Rental",
  "Hospitality",
  "Construction",
  "Education",
  "Legal / Consulting",
  "Energy",
];

interface TemplateSelectorProps {
  selectedTemplateId: string | null;
  onSelect: (id: string) => void;
}

type TemplateItem = (typeof industryTemplates)[number];

const customTemplate = {
  id: "custom",
  name: "Build Custom CRM",
  industry: "Tailored Workspace",
  description:
    "Select CRM modules, configure pipeline stages, and design custom fields for a workspace built around your process.",
  icon: "Settings2",
  features: ["Module Builder", "Custom Fields", "Pipeline Designer"],
  enabledModules: {
    accounts: true,
    opportunities: true,
    contacts: true,
    leads: true,
    whatsapp: true,
  },
  crmCustomFields: [],
  whatsappTemplates: [],
} as unknown as TemplateItem;

function getActiveModules(template: TemplateItem) {
  return Object.entries(template.enabledModules)
    .filter(([, enabled]) => enabled)
    .map(([name]) => {
      if (name === "purchaseOrders") return "Purchase Orders";
      return name.charAt(0).toUpperCase() + name.slice(1);
    });
}

export function TemplateSelector({ selectedTemplateId, onSelect }: TemplateSelectorProps) {
  const [selectedSector, setSelectedSector] = useState("All");

  const templates = useMemo(() => {
    const filtered =
      selectedSector === "All"
        ? industryTemplates
        : industryTemplates.filter((template) => template.industry === selectedSector);

    return selectedSector === "All" ? [customTemplate, ...filtered] : filtered;
  }, [selectedSector]);

  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) ??
    (selectedTemplateId === "custom" ? customTemplate : templates[0]);

  const selectedModules = selectedTemplate ? getActiveModules(selectedTemplate) : [];
  const SelectedIcon =
    selectedTemplate && selectedTemplate.id === "custom"
      ? Settings2
      : selectedTemplate
        ? icons[selectedTemplate.icon as keyof typeof icons] || Briefcase
        : Briefcase;

  return (
    <div className="flex w-full flex-col gap-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {sectors.map((sector) => {
            const isActive = selectedSector === sector;

            return (
              <Button
                key={sector}
                type="button"
                size="sm"
                variant={isActive ? "default" : "outline"}
                onClick={() => setSelectedSector(sector)}
                className="shrink-0 rounded-full text-[11px]"
              >
                {sector}
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <ScrollArea className="h-[360px] rounded-lg border border-border/50">
          <div className="flex flex-col gap-2 p-2">
            {templates.map((template) => {
              const IconComponent =
                template.id === "custom"
                  ? Settings2
                  : icons[template.icon as keyof typeof icons] || Briefcase;
              const isSelected = selectedTemplateId === template.id;
              const activeModules = getActiveModules(template);

              return (
                <button
                  key={template.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelect(template.id)}
                  className={cn(
                    "group flex w-full gap-3 rounded-lg border bg-card p-3 text-left transition-colors",
                    "hover:border-primary/60 hover:bg-accent/40",
                    isSelected && "border-primary bg-primary/[0.04] ring-1 ring-primary",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-md",
                      isSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <IconComponent className="size-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {template.name}
                        </div>
                        <div className="truncate text-[10px] font-semibold uppercase tracking-wide text-primary">
                          {template.industry}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3" />
                        </span>
                      )}
                    </div>

                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {template.description}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {template.features.slice(0, 2).map((feature) => (
                        <Badge key={feature} variant="secondary" className="max-w-28 truncate text-[10px]">
                          {feature}
                        </Badge>
                      ))}
                      <Badge variant="outline" className="text-[10px]">
                        {activeModules.length} modules
                      </Badge>
                    </div>
                  </div>
                </button>
              );
            })}

            {templates.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  No blueprints found for this sector.
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        {selectedTemplate && (
          <Card className="h-fit border-primary/20 bg-card/80">
            <CardHeader className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <SelectedIcon className="size-5" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base leading-snug">{selectedTemplate.name}</CardTitle>
                  <CardDescription className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                    {selectedTemplate.industry}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 p-4 pt-0 text-xs">
              <p className="leading-relaxed text-muted-foreground">
                {selectedTemplate.description}
              </p>

              <Separator />

              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Layers className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground">Enabled modules</div>
                    <div className="mt-1 text-muted-foreground">
                      {selectedModules.slice(0, 6).join(", ")}
                      {selectedModules.length > 6 ? ` +${selectedModules.length - 6}` : ""}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Settings2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">Custom fields</div>
                    <div className="mt-1 text-muted-foreground">
                      {selectedTemplate.crmCustomFields?.length || 0} included
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <MessageSquareCode className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">WhatsApp templates</div>
                    <div className="mt-1 text-muted-foreground">
                      {selectedTemplate.whatsappTemplates?.length || 0} automations
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-1.5">
                {selectedTemplate.features.slice(0, 5).map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-[10px]">
                    {feature}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
