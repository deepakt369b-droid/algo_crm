"use client";

import { useState } from "react";
import { industryTemplates } from "@/lib/templates/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Flame
} from "lucide-react";

const icons = {
  Building: Building,
  Briefcase: Briefcase,
  Stethoscope: Stethoscope,
  Wrench: Wrench,
  Car: Car,
  Hotel: Hotel,
  Hammer: Hammer,
  GraduationCap: GraduationCap,
  Scale: Scale,
  Flame: Flame,
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

export function TemplateSelector({ selectedTemplateId, onSelect }: TemplateSelectorProps) {
  const [selectedSector, setSelectedSector] = useState("All");

  const filteredTemplates = selectedSector === "All"
    ? industryTemplates
    : industryTemplates.filter((t) => t.industry === selectedSector);

  return (
    <div className="space-y-6 w-full py-2">
      {/* Premium Sector Filtering Pills */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-border/40">
        {sectors.map((sector) => {
          const isActive = selectedSector === sector;
          return (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer border select-none",
                isActive
                  ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "bg-muted/40 hover:bg-muted border-border/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {sector}
            </button>
          );
        })}
      </div>

      {/* Grid of blueprint cards */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm">
          No blueprints found for the selected sector.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {selectedSector === "All" && (
            <Card 
              className={cn(
                "relative cursor-pointer transition-all duration-300 overflow-hidden select-none flex flex-col h-full glass-card border-2",
                "hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5",
                selectedTemplateId === "custom"
                  ? "border-primary ring-2 ring-primary bg-primary/[0.03] dark:bg-primary/[0.01]" 
                  : "border-dashed border-border/80"
              )}
              onClick={() => onSelect("custom")}
            >
              {selectedTemplateId === "custom" && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-lg text-xs font-semibold flex items-center gap-1 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3px]" /> Custom Design
                </div>
              )}
              <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3 pt-5">
                <div className={cn(
                  "p-3 rounded-xl transition-colors duration-300 bg-gradient-to-tr from-primary to-purple-500 text-white shadow-md shadow-primary/10"
                )}>
                  <Settings2 className="w-6 h-6" />
                </div>
                <div className="flex flex-col pr-24">
                  <CardTitle className="text-lg font-bold tracking-tight">Build Custom CRM</CardTitle>
                  <CardDescription className="text-xs font-semibold text-primary mt-0.5 uppercase tracking-wider">
                    Tailored Workspace
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between pt-0 pb-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Select your own CRM modules, configure pipeline stages, and design custom contact fields interactively.
                </p>
                <div className="mt-4 pt-3 border-t border-border/40 text-[10px] text-primary font-bold tracking-wider uppercase">
                  → Click to launch playground
                </div>
              </CardContent>
            </Card>
          )}

          {filteredTemplates.map((template) => {
            const IconComponent = icons[template.icon as keyof typeof icons] || Briefcase;
            const isSelected = selectedTemplateId === template.id;

            // Extract enabled modules names
            const activeModules = Object.entries(template.enabledModules)
              .filter(([_, enabled]) => enabled)
              .map(([name]) => {
                if (name === "purchaseOrders") return "Purchase Orders";
                return name.charAt(0).toUpperCase() + name.slice(1);
              });

            return (
              <Card 
                key={template.id} 
                className={cn(
                  "relative cursor-pointer transition-all duration-300 overflow-hidden select-none flex flex-col h-full glass-card",
                  "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
                  isSelected 
                    ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/[0.03] dark:bg-primary/[0.01]" 
                    : "border-border/60"
                )}
                onClick={() => onSelect(template.id)}
              >
                {/* Top selection indicator tag */}
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-lg text-xs font-semibold flex items-center gap-1 shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3px]" /> Active Template
                  </div>
                )}

                <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3 pt-5">
                  <div className={cn(
                    "p-3 rounded-xl transition-colors duration-300",
                    isSelected ? "bg-primary/20 text-primary" : "bg-muted/70 text-muted-foreground"
                  )}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col pr-24">
                    <CardTitle className="text-lg font-bold tracking-tight">{template.name}</CardTitle>
                    <CardDescription className="text-xs font-medium text-primary mt-0.5 uppercase tracking-wider">
                      {template.industry}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-between pt-0 pb-5">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {template.description}
                    </p>

                    {/* Features badges */}
                    <div className="flex flex-wrap gap-1.5 pb-2">
                      {template.features.map((feature) => (
                        <Badge 
                          key={feature} 
                          variant="secondary" 
                          className="text-[10px] font-semibold px-2 py-0.5 bg-muted/50 border-none hover:bg-muted"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    {/* Visual Engine Specs to wow the user */}
                    <div className="border-t border-border/40 pt-3 space-y-2.5 text-xs text-muted-foreground">
                      {/* Enabled Modules */}
                      <div className="flex items-start gap-2">
                        <Layers className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0 opacity-70" />
                        <div>
                          <span className="font-semibold text-foreground">Modules: </span>
                          <span>{activeModules.join(", ")}</span>
                        </div>
                      </div>

                      {/* Custom Fields */}
                      {template.crmCustomFields && template.crmCustomFields.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Settings2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0 opacity-70" />
                          <div>
                            <span className="font-semibold text-foreground">Custom Fields: </span>
                            <span className="italic">
                              {template.crmCustomFields.map((f: any) => `${f.name} (${f.type})`).join(", ")}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* WhatsApp Automated Templates */}
                      {template.whatsappTemplates && template.whatsappTemplates.length > 0 && (
                        <div className="flex items-start gap-2">
                          <MessageSquareCode className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0 opacity-70" />
                          <div>
                            <span className="font-semibold text-foreground">WA Automations: </span>
                            <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">
                              {template.whatsappTemplates[0].name}
                            </code>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
