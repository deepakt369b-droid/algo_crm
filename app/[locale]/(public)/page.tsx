"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Stethoscope, 
  Briefcase, 
  Car, 
  Wrench, 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare, 
  Database, 
  Settings2, 
  Sparkles, 
  Layers, 
  ShieldAlert, 
  UserCheck2,
  TrendingUp,
  Star
} from "lucide-react";

// Mock data to drive the live interactive CRM mockup
const industryPreviews = {
  "real-estate": {
    name: "Real Estate CRM",
    badge: "Property Listings & Leads",
    kanban: [
      { id: "1", title: "Luxury Penthouse, Downtown", price: "$1,250,000", badge: "Buyer Match", detail: "Condo · 3 bed" },
      { id: "2", title: "Suburban Family Villa", price: "$680,000", badge: "Viewing Scheduled", detail: "House · 4 bed" },
    ],
    whatsapp: {
      client: "Sarah Jenkins (Buyer)",
      message: "Hi Sarah! Here are the details for the Luxury Penthouse you requested. Would you like to schedule a viewing tomorrow at 2 PM?",
      reply: "Yes, please! That works perfectly for me. Send the address."
    },
    specs: ["Property Listings Module", "Buyer-Seller Matchmaking", "Automated Showing Scheduling"]
  },
  "clinic": {
    name: "Clinic Management",
    badge: "Patient Records & Bookings",
    kanban: [
      { id: "1", title: "Jane Doe - Consultation", price: "Checked In", badge: "Dr. Evans", detail: "Cardiology · New Patient" },
      { id: "2", title: "Robert Miller - Checkup", price: "Scheduled", badge: "Dr. Evans", detail: "Orthopedics · Follow-up" },
    ],
    whatsapp: {
      client: "Jane Doe (Patient)",
      message: "Hello Jane! Your appointment with Dr. Evans is scheduled for tomorrow at 10:00 AM at Suite 402.",
      reply: "Thank you for the reminder! I will be there 10 minutes early."
    },
    specs: ["Patient Profiles & Records", "Appointment Auto-Reminder", "Medical History Fields"]
  },
  "smb": {
    name: "Small Business (SMB)",
    badge: "General Sales Pipeline",
    kanban: [
      { id: "1", title: "Enterprise SaaS License", price: "$12,000/yr", badge: "Negotiation", detail: "150 Seats · Pro Plan" },
      { id: "2", title: "Consulting Agreement", price: "$4,500/mo", badge: "Proposal Sent", detail: "Retainer · 6 months" },
    ],
    whatsapp: {
      client: "Mark Vance (CEO)",
      message: "Hi Mark! I've sent over the customized consulting proposal. Let me know if you have any questions.",
      reply: "Got it, looks solid. Let's sign the contract on Monday."
    },
    specs: ["Sales Pipeline & Deferrals", "Contract Agreements", "Invoicing & Target Tracking"]
  },
  "hardware-trading": {
    name: "Hardware & B2B Trading",
    badge: "Wholesale & SKU Tracking",
    kanban: [
      { id: "1", title: "Industrial Steel Bolts (Bulk)", price: "$8,400", badge: "Purchase Order", detail: "SKU: SB-8921 · 5,000 units" },
      { id: "2", title: "Heavy Duty Power Drills", price: "$14,200", badge: "B2B Delivery", detail: "SKU: PD-440 · 120 units" },
    ],
    whatsapp: {
      client: "Apex Tooling Inc (Distributor)",
      message: "Hello! Wholesale Order #9021 is packed and shipped. Tracking number is active.",
      reply: "Perfect, thank you! The order arrived ahead of schedule."
    },
    specs: ["Inventory & SKU Tracking", "Supplier Catalogues", "Bulk Wholesaling & Orders"]
  },
  "car-rental": {
    name: "Car Rentals",
    badge: "Fleet & Bookings",
    kanban: [
      { id: "1", title: "Tesla Model 3 (Booking #22)", price: "$420 / 3 days", badge: "Active Rental", detail: "Plate: EV-902-Z · Renter: John" },
      { id: "2", title: "Ford Mustang GT (Booking #24)", price: "$650 / 4 days", badge: "Confirmed", detail: "Plate: GT-772-X · Renter: Lily" },
    ],
    whatsapp: {
      client: "John Carter (Renter)",
      message: "Hi John! Your Tesla Model 3 rental starts tomorrow at 9:00 AM. Please click here to upload your driver's license.",
      reply: "Just uploaded it. See you guys tomorrow morning!"
    },
    specs: ["Vehicle Fleet Tracking", "Damage Reports Log", "Rental Agreement Workflows"]
  }
};

export default function LandingPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<keyof typeof industryPreviews>("real-estate");
  const [activeTab, setActiveTab] = useState<"kanban" | "whatsapp">("kanban");

  const preview = industryPreviews[selectedIndustry];

  return (
    <div className="flex flex-col min-h-screen bg-grid-pattern bg-background">
      
      {/* 1. Hero Section with Glow & Interactive Mockup */}
      <section className="relative px-4 py-24 md:py-32 lg:py-36 flex flex-col items-center overflow-hidden">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-primary/10 dark:bg-primary/5 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-[10%] right-[15%] w-[400px] h-[400px] bg-blue-500/10 dark:bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" style={{ animationDelay: "-3s" }} />

        <div className="relative z-10 max-w-5xl mx-auto space-y-8 text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Industry-Adapting Multi-Tenant CRM Engine
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-foreground">
            The CRM built specifically for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-blue-500 dark:to-emerald-400">
              Your Exact Industry
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Flowline Pro is a highly adaptive multi-tenant CRM. Stop forcing your team to use generic tables. Select your blueprint, spin up isolated schemas, and trigger automated WhatsApp customer workflows instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-bold shadow-md cursor-pointer group" asChild>
              <Link href="/sign-up">
                Start Free Trial 
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base font-semibold cursor-pointer glass-card" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>

        {/* INTERACTIVE PRODUCT DEMO SHIFT CONTAINER */}
        <div className="relative z-10 w-full max-w-5xl mx-auto mt-20 px-2 sm:px-6">
          <div className="border border-border/80 rounded-2xl shadow-2xl shadow-primary/5 dark:shadow-primary/10 bg-background/90 backdrop-blur overflow-hidden glass-card">
            {/* Top Bar (Interactive Industry Selector) */}
            <div className="flex flex-wrap items-center justify-between border-b border-border/80 bg-muted/30 px-4 py-3 gap-3">
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs font-mono text-muted-foreground ml-2">flowlinepro-workspace-demo</span>
              </div>
              
              {/* Industry Toggles */}
              <div className="flex flex-wrap gap-1 bg-muted rounded-xl p-1 border">
                {(Object.keys(industryPreviews) as Array<keyof typeof industryPreviews>).map((key) => {
                  const isActive = selectedIndustry === key;
                  const label = key === "real-estate" ? "Real Estate" : 
                                key === "clinic" ? "Healthcare" : 
                                key === "smb" ? "General SMB" : 
                                key === "hardware-trading" ? "B2B Trading" : "Car Rentals";
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedIndustry(key)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        isActive 
                          ? "bg-background text-primary shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dashboard Workspace Mockup */}
            <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[380px]">
              
              {/* Sidebar Info */}
              <div className="lg:col-span-1 border-r border-border/80 p-5 bg-muted/10 flex flex-col justify-between">
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Layers className="w-4 h-4 text-primary" /> Active Schema
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Instantly loaded modules & custom data columns.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">CRM Modules</span>
                    <div className="flex flex-wrap gap-1">
                      {preview.specs.map((spec) => (
                        <Badge key={spec} variant="outline" className="text-[10px] py-0.5 border-primary/20 bg-primary/5 text-primary">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CRM Controls */}
                <div className="mt-8 pt-4 border-t border-border/40 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Dashboard Preview</span>
                  <div className="grid grid-cols-2 gap-1 bg-muted p-1 rounded-lg border">
                    <button 
                      onClick={() => setActiveTab("kanban")}
                      className={`text-[10px] font-bold py-1.5 rounded transition-all cursor-pointer ${activeTab === "kanban" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Kanban Board
                    </button>
                    <button 
                      onClick={() => setActiveTab("whatsapp")}
                      className={`text-[10px] font-bold py-1.5 rounded transition-all cursor-pointer ${activeTab === "whatsapp" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      WA Chat API
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Content Pane */}
              <div className="lg:col-span-3 p-6 flex flex-col bg-background">
                {activeTab === "kanban" ? (
                  /* KANBAN BOARD SCREEN */
                  <div className="space-y-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Active Deals
                        </span>
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold text-xs">
                          {preview.badge}
                        </Badge>
                      </div>

                      {/* Kanban Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {preview.kanban.map((item, idx) => (
                          <div 
                            key={item.id} 
                            className="p-4 rounded-xl border border-border bg-muted/20 hover:border-primary/30 transition-all flex flex-col justify-between h-[110px] shadow-xs"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-bold truncate text-foreground">{item.title}</h4>
                                <span className="text-[10px] bg-background text-muted-foreground px-2 py-0.5 rounded border border-border/80 whitespace-nowrap">
                                  {item.badge}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground mt-1 block">
                                {item.detail}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/40">
                              <span className="text-xs font-mono font-bold text-foreground">Custom fields active</span>
                              <span className="text-xs font-extrabold text-primary">{item.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-[10px] text-muted-foreground border-t border-border/40 pt-4 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" /> Notice how columns and database schema dynamically restructure themselves for {preview.name}!
                    </div>
                  </div>
                ) : (
                  /* WHATSAPP CHAT PREVIEW SCREEN */
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 border-b pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                            WA
                          </div>
                          <div>
                            <span className="text-xs font-bold block text-foreground">{preview.whatsapp.client}</span>
                            <span className="text-[9px] text-emerald-500 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Session
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 bg-emerald-500/5 text-xs font-bold px-2.5 py-0.5">
                          Automated WhatsApp Message
                        </Badge>
                      </div>

                      {/* Chat Bubbles */}
                      <div className="space-y-3">
                        {/* Sent Message */}
                        <div className="flex justify-end pl-10">
                          <div className="bg-emerald-500 text-white text-xs p-3 rounded-2xl rounded-tr-none shadow-xs max-w-sm leading-relaxed">
                            <span className="block font-mono text-[9px] text-white/70 mb-1">FLOWLINE PRO AUTO-TRIGGER</span>
                            {preview.whatsapp.message}
                          </div>
                        </div>

                        {/* Received Message */}
                        <div className="flex justify-start pr-10">
                          <div className="bg-muted/60 text-foreground text-xs p-3 rounded-2xl rounded-tl-none shadow-xs max-w-sm border leading-relaxed">
                            {preview.whatsapp.reply}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-muted-foreground border-t border-border/40 pt-4 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-primary shrink-0" /> Auto-trigger rules invoke templates instantly based on pipeline stage status.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Premium Bento Grid Features Section */}
      <section id="features" className="py-24 px-4 max-w-5xl mx-auto w-full border-t border-border/40">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="px-3 py-1 text-primary border-primary/20 bg-primary/5 text-xs font-bold">
            High Performance Architecture
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Designed for scale. Engineered for efficiency.
          </h2>
          <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience absolute isolation. Built on a modular tenant architecture with integrated communication layers.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Large Card: Isolated Database schemas */}
          <Card className="md:col-span-2 border-border/60 glass-card p-6 flex flex-col justify-between hover:border-primary/30 transition-all duration-300">
            <CardHeader className="p-0">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                <Database className="w-5 h-5" />
              </div>
              <CardTitle className="text-xl font-bold">Isolated Tenant Databases</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Security and reliability without compromises.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-4 flex-1">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Flowline Pro implements advanced tenant isolation. Your leads, customer pipelines, files, and settings remain isolated in logical schemas. Custom database columns are hot-loaded on a per-workspace basis instantly, keeping performance smooth and fast.
              </p>
            </CardContent>
          </Card>

          {/* Card: WhatsApp CRM Automation */}
          <Card className="md:col-span-1 border-border/60 glass-card p-6 flex flex-col justify-between hover:border-primary/30 transition-all duration-300">
            <CardHeader className="p-0">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <CardTitle className="text-xl font-bold">WhatsApp Triggers</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Zero friction notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-4 flex-1">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Configure pipeline workflows that automatically trigger official WhatsApp templates based on deal actions, appointment updates, or registration forms.
              </p>
            </CardContent>
          </Card>

          {/* Card: No-code custom fields */}
          <Card className="md:col-span-1 border-border/60 glass-card p-6 flex flex-col justify-between hover:border-primary/30 transition-all duration-300">
            <CardHeader className="p-0">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500 mb-4">
                <Settings2 className="w-5 h-5" />
              </div>
              <CardTitle className="text-xl font-bold">Custom Meta Fields</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Flexible schema models.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-4 flex-1">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Create new meta fields (text, numbers, datetimes, selects) for your products, contacts, and opportunities with a single click. Hot-loaded instantly.
              </p>
            </CardContent>
          </Card>

          {/* Large Card: Deep Insights */}
          <Card className="md:col-span-2 border-border/60 glass-card p-6 flex flex-col justify-between hover:border-primary/30 transition-all duration-300">
            <CardHeader className="p-0">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <CardTitle className="text-xl font-bold">Reporting & B2B Forecasts</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                Make decisions driven by exact data.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-4 flex-1">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Unlock robust campaign and sales analytics reports. Track B2B inventory growth indexes, booking pipeline conversion velocity, wholesale margins, and team performance milestones in clean charts powered by next-generation visualization assets.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. Detailed Showroom Section */}
      <section className="py-24 px-4 max-w-5xl mx-auto w-full border-t border-border/40">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="px-3 py-1 text-primary border-primary/20 bg-primary/5 text-xs font-bold">
            Industry Blueprints
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Tailored modules for high-growth operations
          </h2>
          <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your predefined template. Every asset is perfectly configured to save weeks of custom programming.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <Card className="border-border/60 hover:border-primary/30 transition-all glass-card flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-primary/15 text-primary rounded-lg flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg font-bold">Real Estate Blueprint</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Property brokerage & agents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 pb-5">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Optimized for tracking high-ticket assets. Includes preconfigured property catalogues, custom target prices, and lead-matching matrices.
              </p>
              <ul className="space-y-1.5 text-xs text-muted-foreground border-t pt-3">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Property Listings Module</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Buyer matching rules</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Automated listing templates</li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="border-border/60 hover:border-primary/30 transition-all glass-card flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center mb-3">
                <Stethoscope className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg font-bold">Healthcare & Clinic</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Patient bookings & history.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 pb-5">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Engineered with high privacy concerns. Keep patient profiles, medical backgrounds, and scheduling aligned in one secured portal.
              </p>
              <ul className="space-y-1.5 text-xs text-muted-foreground border-t pt-3">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Patient Profiles & Notes</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> WA Booking auto-reminders</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Next appointment scheduling</li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="border-border/60 hover:border-primary/30 transition-all glass-card flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-lg flex items-center justify-center mb-3">
                <Wrench className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg font-bold">Advanced Inventory & Procurement</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Pro stock logs & purchasing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 pb-5">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Streamline operations with premium Multi-Warehouse Inventory Tracking, automated stock reorder thresholds, and Purchase Order Approval workflows.
              </p>
              <ul className="space-y-1.5 text-xs text-muted-foreground border-t pt-3">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-orange-500" /> Multi-Warehouse Stock Tracking</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-orange-500" /> Auto-Reorder & Alerts Thresholds</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-orange-500" /> Purchase Order Approval Workflows</li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 4 */}
          <Card className="border-border/60 hover:border-primary/30 transition-all glass-card flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center mb-3">
                <Car className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg font-bold">Automotive Rentals</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Vehicle fleet & bookings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 pb-5">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Perfect for local car rentals, premium chauffeur agencies, and fleets. Manage active plates, booking calendars, and customer files.
              </p>
              <ul className="space-y-1.5 text-xs text-muted-foreground border-t pt-3">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Active Fleet Inventory logs</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Rental status pipelines</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Auto-booking receipts (WA)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 5 */}
          <Card className="border-border/60 hover:border-primary/30 transition-all glass-card flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-lg flex items-center justify-center mb-3">
                <Briefcase className="w-5 h-5" />
              </div>
              <CardTitle className="text-lg font-bold">Small Business (SMB)</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">General CRM pipelines.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 pb-5">
              <p className="text-xs text-muted-foreground leading-relaxed">
                A highly versatile system that handles custom sales funnels, contract proposals, follow-ups, and customer analytics out of the box.
              </p>
              <ul className="space-y-1.5 text-xs text-muted-foreground border-t pt-3">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-500" /> Sales Pipelines & Steps</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-500" /> Task Management board</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-500" /> Invoicing & Email reminders</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. Elegant Testimonial Grid */}
      <section className="py-24 px-4 max-w-5xl mx-auto w-full border-t border-border/40">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="px-3 py-1 text-primary border-primary/20 bg-primary/5 text-xs font-bold">
            Trusted Globally
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            What leaders are saying
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/60 glass-card p-6 hover:border-primary/20 transition-colors">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                "As a boutique real estate agency, we struggled to configure Salesforce for property matching. With Flowline Pro, we chose the Real Estate blueprint, imported our property inventory, and started matching buyers automatically in under 5 minutes!"
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs text-primary shadow-xs">
                  MJ
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Marcus Jenkins</h4>
                  <span className="text-[10px] text-muted-foreground">Founder, Jenkins Reality Co.</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 glass-card p-6 hover:border-primary/20 transition-colors">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                "Our clinic's patient intake rate exploded. Having automated WhatsApp reminders linked directly to patient check-in pipelines completely eliminated our appointment no-shows. Security compliance was also extremely simple to check."
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-xs text-blue-500 shadow-xs">
                  DE
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Dr. David Evans</h4>
                  <span className="text-[10px] text-muted-foreground">Clinical Director, Evans Health</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 5. Glowing CTA Conversion Section */}
      <section className="relative py-24 px-6 mb-16 max-w-5xl mx-auto w-full overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 dark:bg-primary/[0.02]">
        <div className="absolute top-1/2 left-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-pulse-glow" />
        
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 font-bold px-3 py-1 rounded-full text-xs">
            Start Instantly
          </Badge>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Ready to transform your business operations?
          </h2>
          <p className="text-md md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Join thousands of modern operations running on Flowline Pro. Creating your isolated workspace takes less than 60 seconds.
          </p>
          <Button size="lg" className="h-12 px-8 text-base font-bold shadow-md cursor-pointer group" asChild>
            <Link href="/sign-up">
              Launch Your Workspace
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

    </div>
  );
}

// Simple custom inline helper to merge classes
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
