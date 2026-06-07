"use client";

import React, { useState, useTransition, useEffect, useOptimistic } from "react";
import { 
  createTemplate, 
  updateTemplate, 
  deleteTemplate, 
  updateTemplateStatus, 
  seedTemplates 
} from "@/actions/superadmin/templates";
import { toast } from "sonner";
import { 
  Sparkles, Plus, Search, Trash2, Edit, Download, ToggleLeft, ToggleRight, 
  Wrench, Building, ShoppingCart, Landmark, Plane, Heart, Trophy, Car, HelpCircle,
  FileText, Check, Loader2, Briefcase, Stethoscope, Hotel, Hammer, GraduationCap, Scale, Flame
} from "lucide-react";
import { industryTemplates } from "@/lib/templates/definitions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { generateAiTemplate } from "@/actions/superadmin/ai-template-generator";
import { cn } from "@/lib/utils";
import CustomCrmPlayground from "@/components/onboarding/CustomCrmPlayground";

interface TemplatesManagerProps {
  initialTemplates: any[];
}

const ICON_MAP: Record<string, any> = {
  Building: Building,
  ShoppingCart: ShoppingCart,
  Landmark: Landmark,
  Plane: Plane,
  Heart: Heart,
  Trophy: Trophy,
  Car: Car,
  Briefcase: Briefcase,
  Stethoscope: Stethoscope,
  Wrench: Wrench,
  Hotel: Hotel,
  Hammer: Hammer,
  GraduationCap: GraduationCap,
  Scale: Scale,
  Flame: Flame,
};

export default function TemplatesManager({ initialTemplates }: TemplatesManagerProps) {
  const [templates, setTemplates] = useState<any[]>(initialTemplates);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  const [optimisticTemplates, addOptimisticTemplate] = useOptimistic<any[], { action: 'delete' | 'toggle', payload: any }>(
    initialTemplates,
    (state, { action, payload }) => {
      switch (action) {
        case 'delete':
          return state.filter(t => t.id !== payload.id);
        case 'toggle':
          return state.map(t => t.id === payload.id ? { ...t, isActive: payload.isActive } : t);
        default:
          return state;
      }
    }
  );

  // AI states
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Modal / Form CRUD states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Building");
  const [features, setFeatures] = useState<string[]>([]);
  const [customFields, setCustomFields] = useState<any[]>([]);

  // Convex mutations
  // Action functions
  const runCreateTemplate = createTemplate;
  const runUpdateTemplate = updateTemplate;
  const runDeleteTemplate = deleteTemplate;
  const runToggleStatus = updateTemplateStatus;
  const runSeedTemplates = seedTemplates;

  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (initialTemplates.length === 0) {
      setIsSeeding(true);
      runSeedTemplates({
        templates: industryTemplates.map((t) => ({
          name: t.name,
          slug: t.slug,
          industry: t.industry,
          description: t.description,
          icon: t.icon,
          features: t.features,
          crmCustomFields: t.crmCustomFields,
          whatsappTemplates: t.whatsappTemplates,
        }))
      })
      .then(() => {
        toast.success("Default templates seeded successfully!");
        window.location.reload();
      })
      .catch((err) => {
        toast.error("Failed to seed industry templates: " + err.message);
        setIsSeeding(false);
      });
    }
  }, [initialTemplates, runSeedTemplates]);

  // Actions
  const handleToggleActive = async (id: any, currentActive: boolean) => {
    const newActive = !currentActive;
    startTransition(() => {
      addOptimisticTemplate({ action: 'toggle', payload: { id, isActive: newActive } });
    });
    try {
      await runToggleStatus({ id, isActive: newActive });
      toast.success("Template status toggled!");
    } catch (err) {
      toast.error("Failed to toggle status.");
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Are you sure you want to delete this template permanently?")) return;
    startTransition(() => {
      addOptimisticTemplate({ action: 'delete', payload: { id } });
    });
    try {
      await runDeleteTemplate({ id });
      toast.success("Template deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete template.");
    }
  };

  const handleDownloadJson = (template: any) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(template, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${template.slug}-template.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("JSON exported successfully!");
  };

  const handleGenerateWithAi = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a description prompt for the AI.");
      return;
    }

    setIsAiGenerating(true);
    try {
      const result = await generateAiTemplate({ prompt: aiPrompt });
      if (result.success && result.data) {
        const spec = result.data;
        // Autofill manual form and open it
        setName(spec.name);
        setSlug(spec.slug);
        setIndustry(spec.industry);
        setDescription(spec.description);
        setIcon(spec.icon || "Building");
        setFeatures(spec.features);
        setCustomFields(spec.crmCustomFields || []);
        
        setAiPrompt("");
        setEditingId(null);
        setIsFormOpen(true);
        toast.success("AI generated template configuration successfully! Please review and save.");
      } else {
        toast.error(result.error || "Failed to generate template with AI.");
      }
    } catch (err) {
      toast.error("AI generation failed.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !industry || !description) {
      toast.error("Please fill in all core fields.");
      return;
    }

    // We now use features and customFields directly from the state

    startTransition(async () => {
      try {
        if (editingId) {
          await runUpdateTemplate({
            id: editingId as any,
            name,
            slug,
            industry,
            description,
            icon,
            features: features,
            crmCustomFields: customFields,
            isActive: true,
          });
          toast.success("Template updated successfully!");
        } else {
          await runCreateTemplate({
            name,
            slug,
            industry,
            description,
            icon,
            features: features,
            crmCustomFields: customFields,
          });
          toast.success("Template created successfully!");
        }

        setIsFormOpen(false);
        // Reset states
        setName("");
        setSlug("");
        setIndustry("");
        setDescription("");
        setFeatures([]);
        setCustomFields([]);
        setEditingId(null);
        window.location.reload();
      } catch (err: any) {
        toast.error(err.message || "Failed to save template.");
      }
    });
  };

  const openEditModal = (template: any) => {
    setEditingId(template.id);
    setName(template.name);
    setSlug(template.slug);
    setIndustry(template.industry);
    setDescription(template.description);
    setIcon(template.icon || "Building");
    setFeatures(Array.isArray(template.features) ? template.features : []);
    setCustomFields(template.crmCustomFields ? template.crmCustomFields : []);
    setIsFormOpen(true);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setIndustry("");
    setDescription("");
    setIcon("Building");
    setFeatures(["accounts", "contacts", "leads", "opportunities", "projects", "invoices"]);
    setCustomFields([
  { name: "budget", type: "NUMBER", label: "Client Budget" },
  { name: "source", type: "TEXT", label: "Lead Niche" }
]);
    setIsFormOpen(true);
  };

  // Filters
  const filteredTemplates = optimisticTemplates.filter((temp) => {
    const matchesSearch = temp.name.toLowerCase().includes(search.toLowerCase()) || 
                          temp.industry.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "ALL" || temp.industry.toUpperCase() === activeCategory.toUpperCase();
    return matchesSearch && matchesCategory;
  });

  if (isSeeding) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8 border border-border/40 rounded-2xl bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="p-4 rounded-full bg-primary/10 text-primary animate-spin">
          <Loader2 className="w-8 h-8" />
        </div>
        <div className="space-y-1.5 text-center relative z-10 max-w-sm">
          <h3 className="font-extrabold text-lg tracking-tight text-foreground">Seeding Industry Blueprints</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Synchronizing default CRM industry blueprints (Real Estate, SMB, Healthcare, Automotive) into your Convex backend database. This will take just a few seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Smart Template Builder (Superadmin-only widget) */}
      <Card className="wa-card bg-gradient-to-tr from-muted/30 to-primary/5 border border-border/40 overflow-hidden relative group">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <CardHeader className="pt-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary animate-pulse">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold tracking-tight">AI Smart Template Architect</CardTitle>
              <CardDescription className="text-xs">
                Describe a business niche. The AI will design custom CRM features, fields, stages, and descriptions.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pb-6 relative z-10">
          <div className="space-y-2">
            <Textarea
              placeholder="e.g. A premium CRM for custom yacht builders, focusing on build milestones, customized interior options, and high-value deposit schedules."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="rounded-xl border-border/60 min-h-[70px] bg-background/60"
              disabled={isAiGenerating}
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleGenerateWithAi}
              disabled={isAiGenerating || !aiPrompt.trim()}
              className="rounded-xl h-10 px-5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/95 hover:to-purple-600/95 text-white gap-2 shadow-md shadow-primary/10 transition-transform active:scale-95"
            >
              {isAiGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating CRM Niche Specs...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Template
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main List toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/30">
        <div className="flex items-center gap-2 bg-muted/40 dark:bg-muted/15 border border-border/40 rounded-full p-1 pl-3 max-w-sm w-full">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-xs outline-none w-full"
          />
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <Button
            onClick={openCreateModal}
            className="rounded-xl h-10 px-4 bg-primary text-white hover:bg-primary/95 gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Manual Template
          </Button>
          <DialogContent className="rounded-2xl glass-card border border-border/40 max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 dark:to-teal-400 bg-clip-text text-transparent">
                {editingId ? "Edit Industry Template" : "Add Industry Template"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Design custom CRM layouts, feature modules, and custom database fields.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 py-2">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-xs font-semibold">Template Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Real Estate Pro"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl h-10 border-border/60"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="slug" className="text-xs font-semibold">URL Slug</Label>
                  <Input
                    id="slug"
                    placeholder="e.g. real-estate-pro"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="rounded-xl h-10 border-border/60"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="industry" className="text-xs font-semibold">Industry Category</Label>
                  <Input
                    id="industry"
                    placeholder="e.g. Real Estate, Services"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="rounded-xl h-10 border-border/60"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="icon" className="text-xs font-semibold">Display Icon</Label>
                  <select
                    id="icon"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full rounded-xl h-10 border border-border/60 bg-background px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="Building">Building</option>
                    <option value="ShoppingCart">ShoppingCart</option>
                    <option value="Landmark">Landmark</option>
                    <option value="Plane">Plane</option>
                    <option value="Heart">Heart</option>
                    <option value="Trophy">Trophy</option>
                    <option value="Car">Car</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="desc" className="text-xs font-semibold">Description</Label>
                <Textarea
                  id="desc"
                  placeholder="Summary description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl min-h-[60px] border-border/60"
                  required
                />
              </div>

              <div className="space-y-1">
                <CustomCrmPlayground 
                  initialModules={features}
                  initialFields={customFields}
                  onChange={(config) => {
                    const activeMods = Object.entries(config.enabledModules)
                      .filter(([_, enabled]) => enabled)
                      .map(([name]) => name);
                    setFeatures(activeMods);
                    setCustomFields(config.crmCustomFields);
                  }}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl h-11"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl h-11 bg-primary text-white hover:bg-primary/95"
                >
                  {isPending ? "Saving..." : "Save Template"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => {
          const TempIcon = ICON_MAP[template.icon] || HelpCircle;
          return (
            <Card
              key={template.id}
              className={cn(
                "wa-card border border-border/40 hover:border-primary/20 transition-all duration-200 overflow-hidden relative group",
                !template.isActive && "opacity-60"
              )}
            >
              <div className="p-5 flex flex-col h-full justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="p-2 rounded-xl bg-primary/5 text-primary">
                      <TempIcon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase bg-muted text-muted-foreground px-2.5 py-1 rounded-full border border-border/40 select-none">
                      {template.industry}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-base leading-tight text-foreground">{template.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{template.description}</p>
                  </div>

                  {template.features && template.features.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {template.features.slice(0, 3).map((feat: string) => (
                        <span key={feat} className="text-[9px] font-semibold bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-full">
                          {feat}
                        </span>
                      ))}
                      {template.features.length > 3 && (
                        <span className="text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full select-none">
                          +{template.features.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(template)}
                      className="w-8 h-8 rounded-lg hover:bg-muted"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownloadJson(template)}
                      className="w-8 h-8 rounded-lg hover:bg-muted"
                      title="Download JSON"
                    >
                      <Download className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(template.id)}
                      className="w-8 h-8 rounded-lg hover:bg-destructive/5 hover:text-destructive text-muted-foreground"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(template.id, template.isActive)}
                    className="rounded-xl h-8 text-xs font-semibold gap-1 hover:bg-muted"
                  >
                    {template.isActive ? (
                      <>
                        <ToggleRight className="w-5 h-5 text-emerald-500" />
                        Active
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                        Inactive
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
