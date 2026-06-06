    "use server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { z } from "zod";



import { revalidatePath } from "next/cache";
import { Input } from "@/components/ui/input";
import CopyKeyComponent from "./copy-key";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ResendCard = async () => {
  const setSMTP = async (formData: FormData) => {
    const schema = z.object({
      id: z.string(),
      serviceKey: z.string(),
    });
    const parsed = schema.parse({
      id: formData.get("id"),
      serviceKey: formData.get("serviceKey"),
    });

    //console.log(parsed.id, "id");
    //console.log(parsed.serviceKey, "serviceKey");

    if (!parsed.id) {
      (await supabaseAdmin.from("systemServices").insert({
                        v: 0,
                        name: "resend_smtp",
                        serviceKey: parsed.serviceKey,
                      }).select("*").single()).data;
      revalidatePath("/admin");
    } else {
      (await supabaseAdmin.from("systemServices").update({
                        serviceKey: parsed.serviceKey,
                      }).select("*").single().eq("id", parsed.id).select("*").single()).data;
      revalidatePath("/admin");
    }
  };

  const resend_key = (await supabaseAdmin.from("systemServices").select("*").eq("name", "resend_smtp").maybeSingle()).data;

  return (
    <Card className="min-w-[350px] max-w-[450px]">
      <CardHeader className="text-lg">
        <CardTitle>Resend.com - API Key</CardTitle>
        <CardDescription className="text-xs">
          <p>ENV API key:</p>
          <p>
            {process.env.RESEND_API_KEY ? (
              <CopyKeyComponent
                keyValue={process.env.RESEND_API_KEY}
                message="Resend - API Key"
              />
            ) : (
              "not enabled"
            )}
          </p>
          <p>API key from DB:</p>
          <p>
            {resend_key?.serviceKey ? (
              <CopyKeyComponent
                keyValue={resend_key?.serviceKey}
                message="Resend - API Key"
              />
            ) : (
              "not enabled"
            )}
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <form action={setSMTP}>
          <div>
            <input type="hidden" name="id" value={resend_key?.id} />
            <Input type="text" name="serviceKey" placeholder="Your API key" />
          </div>
          <div className="flex justify-end pt-2 gap-2">
            <Button type={"reset"}>Reset</Button>
            <Button type="submit">Set Resend key</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResendCard;
