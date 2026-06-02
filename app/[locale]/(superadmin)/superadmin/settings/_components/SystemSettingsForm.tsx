"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield, Settings, Server, BrainCircuit, Globe, Mail } from "lucide-react";
import { saveSystemSettings } from "@/actions/superadmin/system-settings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SystemSettingsFormProps {
  initialSettings: {
    appName: string;
    supportEmail: string;
    supportUrl: string;
    selfSignup: boolean;
    autoApproveTenants: boolean;
    sandbox: boolean;
    mfa: boolean;
    otpVerify: boolean;
    sessionTimeout: string;
    senderName: string;
    senderEmail: string;
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPassword: string;
    aiEnrichment: boolean;
    agentChat: boolean;
    aiPlatform: string;
    primaryOpenaiModel: string;
    tokenLimit: string;
    openaiApiKey: string;
    anthropicApiKey: string;
    customAiBaseUrl: string;
  };
  activeTab: string;
}

export default function SystemSettingsForm({ initialSettings, activeTab }: SystemSettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State mapping
  const [appName, setAppName] = useState(initialSettings.appName);
  const [supportEmail, setSupportEmail] = useState(initialSettings.supportEmail);
  const [supportUrl, setSupportUrl] = useState(initialSettings.supportUrl);
  const [selfSignup, setSelfSignup] = useState(initialSettings.selfSignup);
  const [autoApproveTenants, setAutoApproveTenants] = useState(initialSettings.autoApproveTenants);
  const [sandbox, setSandbox] = useState(initialSettings.sandbox);
  const [mfa, setMfa] = useState(initialSettings.mfa);
  const [otpVerify, setOtpVerify] = useState(initialSettings.otpVerify);
  const [sessionTimeout, setSessionTimeout] = useState(initialSettings.sessionTimeout);
  const [senderName, setSenderName] = useState(initialSettings.senderName);
  const [senderEmail, setSenderEmail] = useState(initialSettings.senderEmail);
  const [smtpHost, setSmtpHost] = useState(initialSettings.smtpHost);
  const [smtpPort, setSmtpPort] = useState(initialSettings.smtpPort);
  const [smtpUser, setSmtpUser] = useState(initialSettings.smtpUser);
  const [smtpPassword, setSmtpPassword] = useState(initialSettings.smtpPassword);
  const [aiEnrichment, setAiEnrichment] = useState(initialSettings.aiEnrichment);
  const [agentChat, setAgentChat] = useState(initialSettings.agentChat);
  const [aiPlatform, setAiPlatform] = useState(initialSettings.aiPlatform || "openai");
  const [primaryOpenaiModel, setPrimaryOpenaiModel] = useState(initialSettings.primaryOpenaiModel);
  const [tokenLimit, setTokenLimit] = useState(initialSettings.tokenLimit);
  const [openaiApiKey, setOpenaiApiKey] = useState(initialSettings.openaiApiKey);
  const [anthropicApiKey, setAnthropicApiKey] = useState(initialSettings.anthropicApiKey || "");
  const [customAiBaseUrl, setCustomAiBaseUrl] = useState(initialSettings.customAiBaseUrl || "");

  const handleReset = () => {
    setAppName(initialSettings.appName);
    setSupportEmail(initialSettings.supportEmail);
    setSupportUrl(initialSettings.supportUrl);
    setSelfSignup(initialSettings.selfSignup);
    setAutoApproveTenants(initialSettings.autoApproveTenants);
    setSandbox(initialSettings.sandbox);
    setMfa(initialSettings.mfa);
    setOtpVerify(initialSettings.otpVerify);
    setSessionTimeout(initialSettings.sessionTimeout);
    setSenderName(initialSettings.senderName);
    setSenderEmail(initialSettings.senderEmail);
    setSmtpHost(initialSettings.smtpHost);
    setSmtpPort(initialSettings.smtpPort);
    setSmtpUser(initialSettings.smtpUser);
    setSmtpPassword(initialSettings.smtpPassword);
    setAiEnrichment(initialSettings.aiEnrichment);
    setAgentChat(initialSettings.agentChat);
    setAiPlatform(initialSettings.aiPlatform || "openai");
    setPrimaryOpenaiModel(initialSettings.primaryOpenaiModel);
    setTokenLimit(initialSettings.tokenLimit);
    setOpenaiApiKey(initialSettings.openaiApiKey);
    setAnthropicApiKey(initialSettings.anthropicApiKey || "");
    setCustomAiBaseUrl(initialSettings.customAiBaseUrl || "");
    toast.success("Settings reverted to saved values.");
  };

  const handleSave = () => {
    const payload = {
      appName,
      supportEmail,
      supportUrl,
      selfSignup: String(selfSignup),
      autoApproveTenants: String(autoApproveTenants),
      sandbox: String(sandbox),
      mfa: String(mfa),
      otpVerify: String(otpVerify),
      sessionTimeout,
      senderName,
      senderEmail,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      aiEnrichment: String(aiEnrichment),
      agentChat: String(agentChat),
      aiPlatform,
      primaryOpenaiModel,
      tokenLimit,
      openaiApiKey,
      anthropicApiKey,
      customAiBaseUrl,
    };

    startTransition(async () => {
      try {
        const result = await saveSystemSettings(payload);
        if (result.success) {
          toast.success("System configurations saved successfully!");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to save configurations.");
        }
      } catch (err) {
        toast.error("An error occurred while saving.");
      }
    });
  };

  if (activeTab === "general") {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="wa-card overflow-hidden border border-border/40 relative">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-purple-600" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold tracking-tight">Platform Branding</CardTitle>
                  <CardDescription className="text-xs">Configure core branding and names</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app-name" className="text-xs font-semibold">Application Name</Label>
                <Input
                  id="app-name"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Enter app name"
                  className="rounded-xl h-10 border-border/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email" className="text-xs font-semibold">Support Email Address</Label>
                <Input
                  id="support-email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="Enter support email"
                  className="rounded-xl h-10 border-border/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-url" className="text-xs font-semibold">Support Helpdesk URL</Label>
                <Input
                  id="support-url"
                  value={supportUrl}
                  onChange={(e) => setSupportUrl(e.target.value)}
                  placeholder="Enter helpdesk URL"
                  className="rounded-xl h-10 border-border/60"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="wa-card overflow-hidden border border-border/40 relative">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold tracking-tight">Tenant & User Defaults</CardTitle>
                  <CardDescription className="text-xs">Default policies for registration</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="self-signup" className="text-xs font-semibold">Allow User Sign-up</Label>
                  <span className="text-[10px] text-muted-foreground leading-snug">Allows external visitors to create organizations</span>
                </div>
                <Switch id="self-signup" checked={selfSignup} onCheckedChange={setSelfSignup} />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="auto-approve" className="text-xs font-semibold">Auto-Approve Tenants</Label>
                  <span className="text-[10px] text-muted-foreground leading-snug">Skip review process and active tenant instantly</span>
                </div>
                <Switch id="auto-approve" checked={autoApproveTenants} onCheckedChange={setAutoApproveTenants} />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="sandbox" className="text-xs font-semibold">Enable Sandbox Mode</Label>
                  <span className="text-[10px] text-muted-foreground leading-snug">Create mock data automatically for new tenants</span>
                </div>
                <Switch id="sandbox" checked={sandbox} onCheckedChange={setSandbox} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/40">
          <Button variant="outline" onClick={handleReset} className="rounded-xl h-10 px-4">
            Reset Changes
          </Button>
          <Button
            disabled={isPending}
            onClick={handleSave}
            className="rounded-xl h-10 px-5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/95 hover:to-purple-600/95 text-white shadow-md shadow-primary/10"
          >
            {isPending ? "Saving..." : "Save Configurations"}
          </Button>
        </div>
      </div>
    );
  }

  if (activeTab === "security") {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="wa-card overflow-hidden border border-border/40 relative">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 text-red-500 rounded-xl">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold tracking-tight">Authentication Policy</CardTitle>
                  <CardDescription className="text-xs">Configure security and sign-in constraints</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="mfa" className="text-xs font-semibold">Enforce MFA (Multi-Factor)</Label>
                  <span className="text-[10px] text-muted-foreground leading-snug">Require OTP verification for all admin logins</span>
                </div>
                <Switch id="mfa" checked={mfa} onCheckedChange={setMfa} />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="otp-verify" className="text-xs font-semibold">Mandatory Email Verification</Label>
                  <span className="text-[10px] text-muted-foreground leading-snug">Enforce OTP activation on initial sign-up</span>
                </div>
                <Switch id="otp-verify" checked={otpVerify} onCheckedChange={setOtpVerify} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-timeout" className="text-xs font-semibold">Max Session Lifetime (Days)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="rounded-xl h-10 border-border/60"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="wa-card overflow-hidden border border-border/40 relative">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-500" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold tracking-tight">SMTP & Notification Delivery</CardTitle>
                  <CardDescription className="text-xs">Manage transactional mailing</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mail-provider" className="text-xs font-semibold">Mailing Provider</Label>
                <Input id="mail-provider" defaultValue="Embedded Workers Mail" disabled className="rounded-xl h-10 border-border/60 bg-muted/30" />
                <p className="text-[10px] text-muted-foreground leading-snug">
                  Transactional emails are delivered via Cloudflare Worker-based mailer ({" "}
                  <a href="https://github.com/zou-yu/worker-mailer" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary">
                    worker-mailer
                  </a>
                  ). Resend is also available as a secondary provider.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sender-name" className="text-xs font-semibold">System Sender Name</Label>
                <Input
                  id="sender-name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Flowline Pro Support"
                  className="rounded-xl h-10 border-border/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sender-email" className="text-xs font-semibold">System Sender Address</Label>
                <Input
                  id="sender-email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="e.g. noreply@domain.com"
                  className="rounded-xl h-10 border-border/60"
                />
              </div>
              <div className="space-y-2 pt-2 border-t border-border/40">
                <h4 className="text-sm font-semibold">Custom SMTP Server</h4>
                <p className="text-[10px] text-muted-foreground leading-snug">
                  If you provide SMTP details, they will override the default Workers Mail.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host" className="text-xs font-semibold">SMTP Host</Label>
                  <Input id="smtp-host" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="e.g. smtp.gmail.com" className="rounded-xl h-10 border-border/60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port" className="text-xs font-semibold">SMTP Port</Label>
                  <Input id="smtp-port" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="e.g. 587" className="rounded-xl h-10 border-border/60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-user" className="text-xs font-semibold">SMTP Username</Label>
                  <Input id="smtp-user" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="e.g. user@domain.com" className="rounded-xl h-10 border-border/60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-password" className="text-xs font-semibold">SMTP Password</Label>
                  <Input id="smtp-password" type="password" value={smtpPassword} onChange={(e) => setSmtpPassword(e.target.value)} placeholder={initialSettings.smtpPassword || "Password"} className="rounded-xl h-10 border-border/60" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/40">
          <Button variant="outline" onClick={handleReset} className="rounded-xl h-10 px-4">
            Reset Changes
          </Button>
          <Button
            disabled={isPending}
            onClick={handleSave}
            className="rounded-xl h-10 px-5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/95 hover:to-purple-600/95 text-white shadow-md shadow-primary/10"
          >
            {isPending ? "Saving..." : "Save Configurations"}
          </Button>
        </div>
      </div>
    );
  }

  if (activeTab === "ai") {
    return (
      <div className="space-y-6">
        <Card className="wa-card overflow-hidden border border-border/40 relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold tracking-tight">AI Enrichment & LLM Services</CardTitle>
                <CardDescription className="text-xs">Setup parameters and tokens for agent workflows</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="ai-enrichment" className="text-xs font-semibold">Global AI Enrichment</Label>
                <span className="text-[10px] text-muted-foreground leading-snug">Allows automatic crawling and contact profiling</span>
              </div>
              <Switch id="ai-enrichment" checked={aiEnrichment} onCheckedChange={setAiEnrichment} />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="agent-chat" className="text-xs font-semibold">AI Agent Assistants</Label>
                <span className="text-[10px] text-muted-foreground leading-snug">Enables automated target list generation tools</span>
              </div>
              <Switch id="agent-chat" checked={agentChat} onCheckedChange={setAgentChat} />
            </div>

            <div className="space-y-2 border-t border-border/40 pt-4">
              <Label className="text-xs font-semibold">AI Platform Provider</Label>
              <Select value={aiPlatform} onValueChange={setAiPlatform}>
                <SelectTrigger className="w-full rounded-xl h-10 border-border/60">
                  <SelectValue placeholder="Select Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                  <SelectItem value="custom">Custom (OpenAI Compatible)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {aiPlatform === "openai" && (
              <div className="grid gap-4 md:grid-cols-2 bg-muted/20 p-4 rounded-xl border border-border/50">
                <div className="space-y-2">
                  <Label htmlFor="openai-model" className="text-xs font-semibold">Primary OpenAI Model</Label>
                  <Input
                    id="openai-model"
                    value={primaryOpenaiModel}
                    onChange={(e) => setPrimaryOpenaiModel(e.target.value)}
                    className="rounded-xl h-10 border-border/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token-limit" className="text-xs font-semibold">Max Monthly Tokens Per Tenant</Label>
                  <Input
                    id="token-limit"
                    type="number"
                    value={tokenLimit}
                    onChange={(e) => setTokenLimit(e.target.value)}
                    className="rounded-xl h-10 border-border/60"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="openai-api-key" className="text-xs font-semibold">Global OpenAI API Key</Label>
                  <Input
                    id="openai-api-key"
                    type="password"
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    placeholder={initialSettings.openaiApiKey || "sk-proj-..."}
                    className="rounded-xl h-10 border-border/60"
                  />
                  <p className="text-[10px] text-muted-foreground leading-snug">
                    This key will be used for AI enrichment and agent chat globally if no environment variable is set.
                  </p>
                </div>
              </div>
            )}

            {aiPlatform === "anthropic" && (
              <div className="grid gap-4 md:grid-cols-2 bg-muted/20 p-4 rounded-xl border border-border/50">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="anthropic-api-key" className="text-xs font-semibold">Global Anthropic API Key</Label>
                  <Input
                    id="anthropic-api-key"
                    type="password"
                    value={anthropicApiKey}
                    onChange={(e) => setAnthropicApiKey(e.target.value)}
                    placeholder={initialSettings.anthropicApiKey || "sk-ant-..."}
                    className="rounded-xl h-10 border-border/60"
                  />
                  <p className="text-[10px] text-muted-foreground leading-snug">
                    Provide the Anthropic key to power Claude models.
                  </p>
                </div>
              </div>
            )}

            {aiPlatform === "custom" && (
              <div className="grid gap-4 md:grid-cols-2 bg-muted/20 p-4 rounded-xl border border-border/50">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="custom-ai-base-url" className="text-xs font-semibold">Custom Base URL</Label>
                  <Input
                    id="custom-ai-base-url"
                    type="url"
                    value={customAiBaseUrl}
                    onChange={(e) => setCustomAiBaseUrl(e.target.value)}
                    placeholder="https://api.your-custom-ai.com/v1"
                    className="rounded-xl h-10 border-border/60"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="openai-api-key-custom" className="text-xs font-semibold">API Key (if required)</Label>
                  <Input
                    id="openai-api-key-custom"
                    type="password"
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    placeholder={initialSettings.openaiApiKey || "Token..."}
                    className="rounded-xl h-10 border-border/60"
                  />
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/40">
          <Button variant="outline" onClick={handleReset} className="rounded-xl h-10 px-4">
            Reset Changes
          </Button>
          <Button
            disabled={isPending}
            onClick={handleSave}
            className="rounded-xl h-10 px-5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/95 hover:to-purple-600/95 text-white shadow-md shadow-primary/10"
          >
            {isPending ? "Saving..." : "Save Configurations"}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
