"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import { Mail, ShieldCheck, ShieldAlert, Key, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createEmailAccount, testEmailConnection } from "@/actions/emails/accounts";
import { useRouter } from "next/navigation";

interface SmtpSetupPanelProps {
  onSuccess?: () => void;
}

export default function SmtpSetupPanel({ onSuccess }: SmtpSetupPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message?: string } | null>(null);

  // Form states
  const [label, setLabel] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [imapHost, setImapHost] = useState("");
  const [imapPort, setImapPort] = useState(993);
  const [imapSsl, setImapSsl] = useState(true);
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpSsl, setSmtpSsl] = useState(true);

  const handleTestConnection = async () => {
    if (!username || !password || !imapHost || !imapPort) {
      toast.error("Please fill in IMAP host, port, username and password to test connection.");
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testEmailConnection({
        username,
        password,
        imapHost,
        imapPort,
        imapSsl,
      });

      if (res.ok) {
        setTestResult({ ok: true, message: "IMAP connection successful! Connection verified." });
        toast.success("Connection test successful!");
      } else {
        setTestResult({ ok: false, message: res.error || "Connection failed. Please check host and credentials." });
        toast.error("Connection test failed.");
      }
    } catch (err: any) {
      setTestResult({ ok: false, message: err.message || "An unexpected connection error occurred." });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || !username || !password || !imapHost || !smtpHost) {
      toast.error("Please fill in all required SMTP/IMAP fields.");
      return;
    }

    startTransition(async () => {
      try {
        await createEmailAccount({
          label,
          username,
          password,
          imapHost,
          imapPort,
          imapSsl,
          smtpHost,
          smtpPort,
          smtpSsl,
        });

        toast.success("Mailbox account registered successfully!");
        router.refresh();
        if (onSuccess) onSuccess();
      } catch (err: any) {
        toast.error(err.message || "Failed to save mailbox settings.");
      }
    });
  };

  return (
    <Card className="wa-card max-w-xl mx-auto border border-border/40 overflow-hidden relative">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-purple-600 dark:to-teal-400" />
      <CardHeader className="pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">Mailbox SMTP & IMAP Configuration</CardTitle>
            <CardDescription className="text-xs">
              Configure your transactional SMTP sender credentials and incoming IMAP reader parameters.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <form onSubmit={handleSave} className="space-y-5">
          {/* General */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/30 pb-1 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" /> General Information
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="label" className="text-xs font-semibold">Account Label</Label>
                <Input
                  id="label"
                  placeholder="e.g. Work Email, Personal Mail"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="rounded-xl h-10 border-border/60"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-semibold">Email Username</Label>
                <Input
                  id="username"
                  type="email"
                  placeholder="name@domain.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-xl h-10 border-border/60"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pass" className="text-xs font-semibold">Email Password</Label>
              <Input
                id="pass"
                type="password"
                placeholder="••••••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl h-10 border-border/60"
                required
              />
            </div>
          </div>

          {/* IMAP config */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/30 pb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> Incoming IMAP Reader
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="imap-host" className="text-xs font-semibold">IMAP Host</Label>
                <Input
                  id="imap-host"
                  placeholder="imap.domain.com"
                  value={imapHost}
                  onChange={(e) => setImapHost(e.target.value)}
                  className="rounded-xl h-10 border-border/60"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="imap-port" className="text-xs font-semibold">IMAP Port</Label>
                <Input
                  id="imap-port"
                  type="number"
                  placeholder="993"
                  value={imapPort}
                  onChange={(e) => setImapPort(parseInt(e.target.value, 10))}
                  className="rounded-xl h-10 border-border/60"
                  required
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/30">
              <div className="flex flex-col space-y-0.5">
                <Label htmlFor="imap-ssl" className="text-xs font-semibold">SSL Encryption</Label>
                <span className="text-[10px] text-muted-foreground leading-none">Use TLS/SSL handshake validation</span>
              </div>
              <Switch id="imap-ssl" checked={imapSsl} onCheckedChange={setImapSsl} />
            </div>
          </div>

          {/* SMTP config */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/30 pb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> Outgoing SMTP Sender
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="smtp-host" className="text-xs font-semibold">SMTP Host</Label>
                <Input
                  id="smtp-host"
                  placeholder="smtp.domain.com"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="rounded-xl h-10 border-border/60"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="smtp-port" className="text-xs font-semibold">SMTP Port</Label>
                <Input
                  id="smtp-port"
                  type="number"
                  placeholder="465"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(parseInt(e.target.value, 10))}
                  className="rounded-xl h-10 border-border/60"
                  required
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/30">
              <div className="flex flex-col space-y-0.5">
                <Label htmlFor="smtp-ssl" className="text-xs font-semibold">SSL Encryption</Label>
                <span className="text-[10px] text-muted-foreground leading-none">Use TLS/SSL handshake validation</span>
              </div>
              <Switch id="smtp-ssl" checked={smtpSsl} onCheckedChange={setSmtpSsl} />
            </div>
          </div>

          {testResult && (
            <div className={`p-4 rounded-xl border flex gap-3 text-xs leading-relaxed ${testResult.ok ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
              {testResult.ok ? <ShieldCheck className="w-5 h-5 flex-shrink-0" /> : <ShieldAlert className="w-5 h-5 flex-shrink-0" />}
              <div>
                <p className="font-bold">{testResult.ok ? "Verification Succeeded" : "Verification Failed"}</p>
                <p className="mt-0.5 opacity-90">{testResult.message}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTesting || isPending}
              className="rounded-xl h-10 text-xs px-4 border-border/60"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
            <Button
              type="submit"
              disabled={isPending || isTesting}
              className="rounded-xl h-10 text-xs px-5 bg-primary text-white hover:bg-primary/95"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                "Save Configuration"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
