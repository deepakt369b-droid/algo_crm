"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Plus, Trash2, Layers, Settings2, Sparkles, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomCrmPlaygroundProps {
  onChange: (config: any) => void;
  initialModules?: string[];
  initialStages?: string[];
  initialFields?: Array<{ name: string; type: string; label: string }>;
}

const CRM_MODULES = [
  { id: "accounts", name: "Accounts", desc: "Manage corporate clients and organizations", category: "Core" },
  { id: "contacts", name: "Contacts", desc: "Store individual profile details and touchpoints", category: "Core" },
  { id: "leads", name: "Leads", desc: "Track potential deal targets and scoring options", category: "Core" },
  { id: "opportunities", name: "Opportunities", desc: "Manage sales deal workflows and pipelines", category: "Core" },
  { id: "products", name: "Products", desc: "Maintain product catalog sheets and services", category: "Core" },
  { id: "contracts", name: "Contracts", desc: "Draft legal bindings, terms, and agreements", category: "Core" },
  
  { id: "emails", name: "Emails Integration", desc: "Connect SMTP/IMAP senders and read mailboxes", category: "Communication" },
  { id: "campaigns", name: "Campaigns", desc: "Launch email newsletter blasts and sequences", category: "Communication" },
  { id: "whatsapp", name: "WhatsApp Automation", desc: "Integrate WhatsApp accounts and auto-triggers", category: "Communication" },
  
  { id: "projects", name: "Projects & Tasks", desc: "Design task boards and monitor project cards", category: "Operations" },
  { id: "documents", name: "Documents Vault", desc: "Upload docs and index metadata using AI", category: "Operations" },
  { id: "invoices", name: "Invoicing", desc: "Send invoices, collect payments, and track tax", category: "Operations" },
];

export default function CustomCrmPlayground({ onChange, initialModules, initialStages, initialFields }: CustomCrmPlaygroundProps) {
  const [selectedModules, setSelectedModules] = useState<string[]>(initialModules || [
    "accounts", "contacts", "leads", "opportunities" // defaults
  ]);
  const [stages, setStages] = useState<string[]>(initialStages || [
    "Lead", "Contacted", "Proposal", "Negotiation", "Won"
  ]);
  const [newStage, setNewStage] = useState("");
  
  const [customFields, setCustomFields] = useState<Array<{ name: string; type: string; label: string }>>(initialFields || [
    { name: "niche", type: "TEXT", label: "Client Segment Niche" }
  ]);
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("TEXT");
  const [fieldLabel, setFieldLabel] = useState("");

  const notifyChange = (modules: string[], stg: string[], flds: any[]) => {
    onChange({
      enabledModules: modules.reduce((acc, m) => ({ ...acc, [m]: true }), {}),
      pipelineStages: stg,
      crmCustomFields: flds,
    });
  };

  const toggleModule = (id: string) => {
    const next = selectedModules.includes(id)
      ? selectedModules.filter((m) => m !== id)
      : [...selectedModules, id];
    setSelectedModules(next);
    notifyChange(next, stages, customFields);
  };

  const handleAddStage = () => {
    if (!newStage.trim() || stages.includes(newStage.trim())) return;
    const next = [...stages, newStage.trim()];
    setStages(next);
    setNewStage("");
    notifyChange(selectedModules, next, customFields);
  };

  const handleRemoveStage = (index: number) => {
    const next = stages.filter((_, i) => i !== index);
    setStages(next);
    notifyChange(selectedModules, next, customFields);
  };

  const handleAddField = () => {
    if (!fieldName.trim() || !fieldLabel.trim()) return;
    const key = fieldName.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (customFields.some((f) => f.name === key)) return;

    const next = [...customFields, { name: key, type: fieldType, label: fieldLabel }];
    setCustomFields(next);
    setFieldName("");
    setFieldLabel("");
    setFieldType("TEXT");
    notifyChange(selectedModules, stages, next);
  };

  const handleRemoveField = (name: string) => {
    const next = customFields.filter((f) => f.name !== name);
    setCustomFields(next);
    notifyChange(selectedModules, stages, next);
  };

  return (
    <div className="space-y-6 text-left py-2">
      {/* 1. Modules Selection */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-border/30 pb-1.5">
          <Layers className="w-4 h-4" /> 1. Select CRM Modules
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CRM_MODULES.map((mod) => {
            const isSelected = selectedModules.includes(mod.id);
            return (
              <Card
                key={mod.id}
                onClick={() => toggleModule(mod.id)}
                className={cn(
                  "cursor-pointer transition-all duration-200 p-4 border relative rounded-2xl select-none hover:shadow-md",
                  isSelected
                    ? "border-primary bg-primary/[0.02]"
                    : "border-border/60"
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3px]" />
                  </div>
                )}
                <div className="space-y-1 pr-4">
                  <p className="font-bold text-sm leading-tight">{mod.name}</p>
                  <p className="text-[10px] text-muted-foreground leading-snug">{mod.desc}</p>
                  <span className="inline-block text-[8px] font-bold uppercase bg-muted text-muted-foreground px-2 py-0.5 rounded-full mt-1.5 select-none">
                    {mod.category}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 2. Pipeline Builder */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-border/30 pb-1.5">
          <Settings2 className="w-4 h-4" /> 2. Customize Opportunity Pipeline Stages
        </h3>
        <div className="p-4 rounded-2xl bg-muted/20 border border-border/30 space-y-4">
          <div className="flex flex-wrap gap-2">
            {stages.map((stage, idx) => (
              <div
                key={stage}
                className="flex items-center gap-1 text-xs font-semibold bg-background border border-border/60 pl-3 pr-1.5 py-1.5 rounded-xl shadow-sm select-none"
              >
                <span>{stage}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveStage(idx)}
                  className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors ml-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 max-w-sm">
            <Input
              placeholder="e.g. Contract Signed"
              value={newStage}
              onChange={(e) => setNewStage(e.target.value)}
              className="rounded-xl h-10 border-border/60"
            />
            <Button
              type="button"
              onClick={handleAddStage}
              className="rounded-xl h-10 px-4 shrink-0 bg-primary text-white hover:bg-primary/95"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Custom Fields Builder */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 border-b border-border/30 pb-1.5">
          <Sparkles className="w-4 h-4" /> 3. Add Custom CRM Fields
        </h3>
        <div className="p-4 rounded-2xl bg-muted/20 border border-border/30 space-y-4">
          {customFields.length > 0 && (
            <div className="rounded-xl border border-border/40 divide-y divide-border/40 bg-background overflow-hidden">
              {customFields.map((field) => (
                <div key={field.name} className="flex items-center justify-between p-3">
                  <div>
                    <span className="font-bold text-xs">{field.label}</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-full ml-2 select-none">
                      {field.type}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveField(field.name)}
                    className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3 items-end">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-muted-foreground">Field Label</Label>
              <Input
                placeholder="e.g. Budget size"
                value={fieldLabel}
                onChange={(e) => setFieldLabel(e.target.value)}
                className="rounded-xl h-10 border-border/60"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-muted-foreground">Field Database Key</Label>
              <Input
                placeholder="e.g. budgetSize"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                className="rounded-xl h-10 border-border/60"
              />
            </div>
            <div className="flex gap-2">
              <div className="space-y-1 w-full">
                <Label className="text-[10px] font-bold text-muted-foreground">Field Type</Label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value)}
                  className="w-full rounded-xl h-10 border border-border/60 bg-background px-3 text-sm"
                >
                  <option value="TEXT">Text</option>
                  <option value="NUMBER">Number</option>
                  <option value="BOOLEAN">Yes / No</option>
                  <option value="DATE">Date</option>
                </select>
              </div>
              <Button
                type="button"
                onClick={handleAddField}
                className="rounded-xl h-10 px-4 shrink-0 bg-primary text-white hover:bg-primary/95"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
