"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Mail, Settings, Key, ShieldCheck, ShieldAlert, Loader2, Folder, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createEmailAccount,
  deleteEmailAccount,
  setEmailAccountActive,
  testEmailConnection,
  listImapFolders,
} from "@/actions/emails/accounts";
import type { getEmailAccounts } from "@/actions/emails/accounts";
import { triggerSync } from "@/actions/emails/sync";
import { cn } from "@/lib/utils";

type Account = Awaited<ReturnType<typeof getEmailAccounts>>[number];

export function EmailAccountsList({ accounts }: { accounts: Account[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: "",
    imapHost: "",
    imapPort: "993",
    imapSsl: true,
    smtpHost: "",
    smtpPort: "465",
    smtpSsl: true,
    username: "",
    password: "",
    sentFolderName: "Sent",
  });

  const [provider, setProvider] = useState<"gmail" | "generic">("generic");
  const [discovering, setDiscovering] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);
  const [discoverError, setDiscoverError] = useState<string | null>(null);

  const refresh = () => router.refresh();

  function applyGmailPreset() {
    setProvider("gmail");
    setForm((f) => ({
      ...f,
      label: f.label || "Gmail",
      imapHost: "imap.gmail.com",
      imapPort: "993",
      imapSsl: true,
      smtpHost: "smtp.gmail.com",
      smtpPort: "465",
      smtpSsl: true,
      sentFolderName: "[Gmail]/Sent Mail",
    }));
  }

  async function handleDiscover() {
    setDiscovering(true);
    setDiscoverError(null);
    setFolders([]);
    const result = await listImapFolders({
      imapHost: form.imapHost,
      imapPort: Number(form.imapPort),
      imapSsl: form.imapSsl,
      username: form.username,
      password: form.password,
    });
    setDiscovering(false);
    if (!result.ok) {
      setDiscoverError(result.error ?? "Failed to list folders");
      return;
    }
    setFolders(result.folders);
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    const result = await testEmailConnection({
      imapHost: form.imapHost,
      imapPort: Number(form.imapPort),
      imapSsl: form.imapSsl,
      username: form.username,
      password: form.password,
    });
    setTesting(false);
    setTestResult(result.ok ? "✓ Connection successful" : `✗ ${result.error}`);
  }

  async function handleCreate() {
    await createEmailAccount({
      ...form,
      imapPort: Number(form.imapPort),
      smtpPort: Number(form.smtpPort),
    });
    setOpen(false);
    refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this email account and all synced emails?")) return;
    await deleteEmailAccount(id);
    refresh();
  }

  async function handleToggle(id: string, current: boolean) {
    await setEmailAccountActive(id, !current);
    refresh();
  }

  async function handleSync(id: string) {
    setSyncingId(id);
    try {
      await triggerSync(id);
      refresh();
    } finally {
      setSyncingId(null);
    }
  }

  return (
    <div className="space-y-3">
      {accounts.length === 0 && (
        <p className="text-sm text-muted-foreground">No email accounts connected.</p>
      )}
      {accounts.map((acc) => (
        <div
          key={acc.id}
          className="flex items-center justify-between rounded-md border border-border px-4 py-3"
        >
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{acc.label}</p>
            <p className="text-xs text-muted-foreground">
              {acc.username} @ {acc.imapHost}
            </p>
            {acc.lastSyncedAt && (
              <p className="text-xs text-muted-foreground">
                Last synced: {new Date(acc.lastSyncedAt).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={acc.isActive ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => handleToggle(acc.id, acc.isActive)}
            >
              {acc.isActive ? "Active" : "Inactive"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              disabled={syncingId === acc.id}
              onClick={() => handleSync(acc.id)}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              {syncingId === acc.id ? "Syncing…" : "Sync"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => handleDelete(acc.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setProvider("generic");
            setFolders([]);
            setDiscoverError(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Add Email Account
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border border-border/40 rounded-2xl glass-card">
          <DialogHeader className="border-b border-border/30 pb-4">
            <DialogTitle className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 dark:to-teal-400 bg-clip-text text-transparent flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              {provider === "gmail" ? "Connect Gmail Mailbox" : "Connect Custom IMAP Mailbox"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure SMTP & IMAP credentials to seamlessly send and receive emails inside NextCRM.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Provider quick-select */}
            <div className="flex gap-2 p-1 bg-muted/40 dark:bg-muted/10 rounded-xl max-w-xs border border-border/30">
              <Button
                type="button"
                variant={provider === "gmail" ? "secondary" : "ghost"}
                size="sm"
                className="w-full gap-1.5 rounded-lg text-xs font-bold"
                onClick={applyGmailPreset}
              >
                <svg width="12" height="12" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.2 0 5.9 1.1 8.1 2.9l6-6C34.5 3.1 29.6 1 24 1 14.8 1 7 6.7 3.7 14.7l7 5.4C12.4 14 17.7 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.4c-.5 2.8-2.1 5.2-4.5 6.8l7 5.4C42.9 37.1 46.1 31.3 46.1 24.5z"/>
                  <path fill="#FBBC05" d="M10.7 28.5A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.7-4.5l-7-5.4A23.5 23.5 0 0 0 .5 24c0 3.8.9 7.3 2.7 10.4l7-5.9z"/>
                  <path fill="#34A853" d="M24 46.5c5.6 0 10.3-1.8 13.7-5l-7-5.4c-1.9 1.2-4.2 2-6.7 2-6.3 0-11.6-4.5-13.3-10.5l-7 5.4C7 41.8 14.8 46.5 24 46.5z"/>
                </svg>
                Gmail
              </Button>
              <Button
                type="button"
                variant={provider === "generic" ? "secondary" : "ghost"}
                size="sm"
                className="w-full rounded-lg text-xs font-bold"
                onClick={() => {
                  setProvider("generic");
                  setFolders([]);
                  setDiscoverError(null);
                  setForm((f) => ({
                    ...f,
                    label: f.label === "Gmail" ? "" : f.label,
                    imapHost: f.imapHost === "imap.gmail.com" ? "" : f.imapHost,
                    smtpHost: f.smtpHost === "smtp.gmail.com" ? "" : f.smtpHost,
                    sentFolderName: f.sentFolderName === "[Gmail]/Sent Mail" ? "Sent" : f.sentFolderName,
                  }));
                }}
              >
                Generic IMAP
              </Button>
            </div>

            {/* General Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/30 pb-1 flex items-center gap-1.5 font-sans">
                <Settings className="w-3.5 h-3.5" /> General Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="label" className="text-xs font-semibold">Account Label</Label>
                  <Input
                    id="label"
                    placeholder="e.g. Work Email, Personal Mail"
                    value={form.label}
                    onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                    className="rounded-xl h-10 border-border/60"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs font-semibold">Email Username / Address</Label>
                  <Input
                    id="username"
                    type="email"
                    placeholder="name@domain.com"
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    className="rounded-xl h-10 border-border/60"
                  />
                </div>
              </div>

              {provider === "gmail" && (
                <Alert className="border-blue-200 bg-blue-50/50 text-blue-900 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-200 rounded-2xl p-4">
                  <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-xs leading-relaxed">
                    Gmail requires a <strong>16-character App Password</strong> — your regular Gmail password won&apos;t work.{" "}
                    <a
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-extrabold underline hover:text-blue-500 transition-colors"
                    >
                      Create one here
                    </a>. Enter it below.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="password">
                  {provider === "gmail" ? "Gmail App Password" : "Password"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder={provider === "gmail" ? "xxxx xxxx xxxx xxxx" : "••••••••••••••••"}
                  className="rounded-xl h-10 border-border/60"
                />
              </div>
            </div>

            {/* Incoming IMAP */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/30 pb-1 flex items-center gap-1.5 font-sans">
                <Key className="w-3.5 h-3.5" /> Incoming IMAP Settings
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="imapHost" className="text-xs font-semibold">IMAP Host</Label>
                  <Input
                    id="imapHost"
                    placeholder="imap.domain.com"
                    value={form.imapHost}
                    onChange={(e) => setForm((f) => ({ ...f, imapHost: e.target.value }))}
                    className="rounded-xl h-10 border-border/60"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="imapPort" className="text-xs font-semibold">IMAP Port</Label>
                  <Input
                    id="imapPort"
                    type="number"
                    value={form.imapPort}
                    onChange={(e) => setForm((f) => ({ ...f, imapPort: e.target.value }))}
                    className="rounded-xl h-10 border-border/60"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/30">
                <div className="flex flex-col space-y-0.5">
                  <Label htmlFor="imapSsl" className="text-xs font-semibold">SSL Encryption</Label>
                  <span className="text-[10px] text-muted-foreground leading-none">Use TLS/SSL secure handshake</span>
                </div>
                <Switch
                  id="imapSsl"
                  checked={form.imapSsl}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, imapSsl: v }))}
                />
              </div>
            </div>

            {/* Outgoing SMTP */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/30 pb-1 flex items-center gap-1.5 font-sans">
                <Key className="w-3.5 h-3.5" /> Outgoing SMTP Settings
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="smtpHost" className="text-xs font-semibold">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    placeholder="smtp.domain.com"
                    value={form.smtpHost}
                    onChange={(e) => setForm((f) => ({ ...f, smtpHost: e.target.value }))}
                    className="rounded-xl h-10 border-border/60"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="smtpPort" className="text-xs font-semibold">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={form.smtpPort}
                    onChange={(e) => setForm((f) => ({ ...f, smtpPort: e.target.value }))}
                    className="rounded-xl h-10 border-border/60"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/30">
                <div className="flex flex-col space-y-0.5">
                  <Label htmlFor="smtpSsl" className="text-xs font-semibold">SSL Encryption</Label>
                  <span className="text-[10px] text-muted-foreground leading-none">Use TLS/SSL secure handshake</span>
                </div>
                <Switch
                  id="smtpSsl"
                  checked={form.smtpSsl}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, smtpSsl: v }))}
                />
              </div>
            </div>

            {/* Folder configuration */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/30 pb-1 flex items-center gap-1.5 font-sans">
                <Folder className="w-3.5 h-3.5" /> Mailbox Folders
              </h3>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sentFolderName" className="text-xs font-semibold">Sent Folder Name</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs font-bold gap-1 rounded-lg text-primary hover:bg-primary/5"
                    disabled={discovering || !form.imapHost || !form.username || !form.password}
                    onClick={handleDiscover}
                  >
                    {discovering ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Discovering...
                      </>
                    ) : (
                      "Discover Mailbox Folders"
                    )}
                  </Button>
                </div>
                {folders.length > 0 ? (
                  <select
                    id="sentFolderName"
                    className="flex h-10 w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={form.sentFolderName}
                    onChange={(e) => setForm((f) => ({ ...f, sentFolderName: e.target.value }))}
                  >
                    {folders.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id="sentFolderName"
                    type="text"
                    value={form.sentFolderName}
                    onChange={(e) => setForm((f) => ({ ...f, sentFolderName: e.target.value }))}
                    placeholder='e.g. Sent or [Gmail]/Sent Mail'
                    className="rounded-xl h-10 border-border/60"
                  />
                )}
                {discoverError && (
                  <p className="text-xs text-destructive mt-1 font-semibold">{discoverError}</p>
                )}
              </div>
            </div>

            {/* Test result status panel */}
            {testResult && (
              <div className={cn(
                "p-4 rounded-xl border flex gap-3 text-xs leading-relaxed transition-all",
                testResult.startsWith("✓") 
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-500/30" 
                  : "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/95 dark:text-red-400"
              )}>
                {testResult.startsWith("✓") ? (
                  <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-5 h-5 flex-shrink-0 text-destructive dark:text-red-400" />
                )}
                <div>
                  <p className="font-bold">{testResult.startsWith("✓") ? "Connection Success" : "Connection Failed"}</p>
                  <p className="mt-0.5 opacity-90">{testResult}</p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t border-border/30">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={testing}
                className="rounded-xl h-10 text-xs px-4 border-border/60 font-semibold"
                type="button"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Testing...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>
              <Button
                size="sm"
                onClick={handleCreate}
                className="rounded-xl h-10 text-xs px-5 bg-primary text-white hover:bg-primary/95 font-semibold shadow-sm active:scale-95 transition-transform"
                type="button"
              >
                Save Mailbox
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
