    "use server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

import { revalidatePath } from "next/cache";
import { ExternalLink, MailCheck } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";

const WorkerMailCard = async () => {
  const setWorkerMail = async (formData: FormData) => {
    const schema = z.object({
      id: z.string().optional(),
      mailerUrl: z.string(),
      apiKey: z.string(),
    });
    const parsed = schema.parse({
      id: formData.get("id") || undefined,
      mailerUrl: formData.get("mailerUrl"),
      apiKey: formData.get("apiKey"),
    });

    if (!parsed.id) {
      (await supabaseAdmin.from("systemServices").insert({
                  v: 0,
                  name: "worker_mailer",
                  serviceUrl: parsed.mailerUrl,
                  serviceKey: parsed.apiKey,
                }).select("*").single()).data;
    } else {
      (await supabaseAdmin.from("systemServices").update({
                  serviceUrl: parsed.mailerUrl,
                  serviceKey: parsed.apiKey,
                }).eq("id", parsed.id).select("*").single()).data;
    }
    revalidatePath("/admin/services");
  };

  const removeWorkerMail = async (formData: FormData) => {
    "use server";
    const id = formData.get("id") as string;
    if (id) {
      (await supabaseAdmin.from("systemServices").delete().eq("id", id).select("*").single()).data;
      revalidatePath("/admin/services");
    }
  };

  const workerMail = (await supabaseAdmin.from("systemServices").select("*").eq("name", "worker_mailer").single()).data;

  const envUrl = process.env.WORKER_MAILER_URL;
  const envKey = process.env.WORKER_MAILER_API_KEY;

  return (
    <Card className="min-w-[350px] max-w-[450px]">
      <CardHeader className="text-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
            <MailCheck className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Embedded Workers Mail</CardTitle>
            <CardDescription className="text-xs mt-1">
              Cloudflare Worker-based transactional email delivery
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ENV Configuration Status */}
        <div className="space-y-2 text-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ENV Configuration</p>

          <div className="flex items-center justify-between">
            <Label className="text-xs">WORKER_MAILER_URL</Label>
            <div className="flex items-center gap-1">
              {envUrl ? (
                <>
                  <span className="text-xs text-green-600 font-mono max-w-[200px] truncate">{envUrl}</span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">not set</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">WORKER_MAILER_API_KEY</Label>
            <div className="flex items-center gap-1">
              {envKey ? (
                <span className="text-xs text-green-600">configured</span>
              ) : (
                <span className="text-xs text-muted-foreground">not set</span>
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-3" />

        {/* DB Configuration Form */}
        <form action={setWorkerMail} className="space-y-3">
          <input type="hidden" name="id" value={workerMail?.id || ""} />
          <div className="space-y-1.5">
            <Label htmlFor="mailerUrl" className="text-xs font-medium">
              Worker Mailer URL
            </Label>
            <Input
              id="mailerUrl"
              name="mailerUrl"
              type="text"
              placeholder="https://mailer.your-worker.workers.dev"
              defaultValue={workerMail?.serviceUrl || ""}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="apiKey" className="text-xs font-medium">
              API Key
            </Label>
            <Input
              id="apiKey"
              name="apiKey"
              type="password"
              placeholder="Your worker mailer API key"
              defaultValue={workerMail?.serviceKey || ""}
              className="font-mono text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {workerMail && (
              <Button type="submit" formAction={removeWorkerMail} variant="destructive" size="sm">
                Remove
              </Button>
            )}
            <Button type="submit" size="sm">
              {workerMail ? "Update Config" : "Save Config"}
            </Button>
          </div>
        </form>

        <p className="text-xs text-muted-foreground border-t pt-3">
          <ExternalLink className="inline h-3 w-3 mr-1" />
          Uses{" "}
          <a
            href="https://github.com/zou-yu/worker-mailer"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-primary"
          >
            worker-mailer
          </a>{" "}
          to send transactional emails directly from your Cloudflare Workers.
        </p>
      </CardContent>
    </Card>
  );
};

export default WorkerMailCard;
