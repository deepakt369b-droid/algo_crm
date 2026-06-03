import { z } from "zod";

import { paginationSchema, paginationArgs, listResponse } from "../helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const crmEmailAccountTools = [
  {
    name: "crm_list_email_accounts",
    description: "List the authenticated user's connected email accounts",
    schema: z.object({ ...paginationSchema }),
    async handler(args: { limit: number; offset: number }, userId: string) {
      const where = { userId, isActive: true };
      const [data, total] = await Promise.all([
        (await supabaseAdmin.from("emailAccount").select("id, label, imapHost, imapPort, imapSsl, smtpHost, smtpPort, smtpSsl, username, isActive, sentFolderName, lastSyncedAt, createdAt, updatedAt").order("createdAt", { ascending: false })).data,
        (await supabaseAdmin.from("emailAccount").select("*", { count: 'exact', head: true })).count,
      ]);
      return listResponse(data, total, args.offset);
    },
  },
];
