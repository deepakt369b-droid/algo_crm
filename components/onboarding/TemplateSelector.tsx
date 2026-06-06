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
    <div className="space-y-4 w-full py-1">
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border/40 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sectors.map((sector) => {
          const isActive = selectedSector === sector;
          return (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={cn(
                "shrink-0 text-[11px] px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer border select-none",
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {selectedSector === "All" && (
            <Card 
              className={cn(
                "relative cursor-pointer transition-all duration-200 overflow-hidden select-none flex flex-col min-h-[210px] glass-card border-2",
                "hover:border-primary/50 hover:shadow-md",
                selectedTemplateId === "custom"
                  ? "border-primary ring-2 ring-primary bg-primary/[0.03] dark:bg-primary/[0.01]" 
                  : "border-dashed border-border/80"
              )}
              onClick={() => onSelect("custom")}
            >
              {selectedTemplateId === "custom" && (
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3px]" />
                </div>
              )}
              <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2 pt-4">
                <div className={cn(
                  "p-2.5 rounded-xl transition-colors duration-300 bg-gradient-to-tr from-primary to-purple-500 text-white shadow-md shadow-primary/10"
                )}>
                  <Settings2 className="w-5 h-5" />
                </div>
                <div className="flex min-w-0 flex-col pr-8">
                  <CardTitle className="text-base font-bold tracking-tight leading-snug">Build Custom CRM</CardTitle>
                  <CardDescription className="text-xs font-semibold text-primary mt-0.5 uppercase tracking-wider">
                    Tailored Workspace
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between pt-0 pb-4">
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                  Select your own CRM modules, configure pipeline stages, and design custom contact fields interactively.
                </p>
                <div className="mt-3 pt-3 border-t border-border/40 text-[10px] text-primary font-bold tracking-wider uppercase">
                  Custom setup
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
                  "relative cursor-pointer transition-all duration-200 overflow-hidden select-none flex flex-col min-h-[210px] glass-card",
                  "hover:border-primary/50 hover:shadow-md hover:shadow-primary/5",
                  isSelected 
                    ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/[0.03] dark:bg-primary/[0.01]" 
                    : "border-border/60"
                )}
                onClick={() => onSelect(template.id)}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-1 shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                  </div>
                )}

                <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2 pt-4">
                  <div className={cn(
                    "p-2.5 rounded-xl transition-colors duration-300",
                    isSelected ? "bg-primary/20 text-primary" : "bg-muted/70 text-muted-foreground"
                  )}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex min-w-0 flex-col pr-8">
                    <CardTitle className="text-base font-bold tracking-tight leading-snug line-clamp-2">{template.name}</CardTitle>
                    <CardDescription className="text-xs font-medium text-primary mt-0.5 uppercase tracking-wider">
                      {template.industry}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-between pt-0 pb-4">
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {template.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {template.features.slice(0, 3).map((feature) => (
                        <Badge 
                          key={feature} 
                          variant="secondary" 
                          className="text-[10px] font-semibold px-2 py-0.5 bg-muted/50 border-none hover:bg-muted"
                        >
                          {feature}
                        </Badge>
                      ))}
                      {template.features.length > 3 && (
                        <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5">
                          +{template.features.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="border-t border-border/40 pt-3 space-y-2 text-[11px] text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <Layers className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0 opacity-70" />
                        <div className="min-w-0">
                          <span className="font-semibold text-foreground">Modules: </span>
                          <span>{activeModules.slice(0, 4).join(", ")}</span>
                          {activeModules.length > 4 && <span> +{activeModules.length - 4}</span>}
                        </div>
                      </div>

                      {template.crmCustomFields && template.crmCustomFields.length > 0 && (
                        <div className="flex items-start gap-2">
                          <Settings2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0 opacity-70" />
                          <div className="min-w-0">
                            <span className="font-semibold text-foreground">Fields: </span>
                            <span>{template.crmCustomFields.length} included</span>
                          </div>
                        </div>
                      )}

                      {template.whatsappTemplates && template.whatsappTemplates.length > 0 && (
                        <div className="flex items-start gap-2">
                          <MessageSquareCode className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0 opacity-70" />
                          <div className="min-w-0">
                            <span className="font-semibold text-foreground">WhatsApp: </span>
                            <span>{template.whatsappTemplates.length} templates</span>
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
