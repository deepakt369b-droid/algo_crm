import { z } from "zod";

import {
  paginationSchema,
  paginationArgs,
  listResponse,
  itemResponse,
  ilike,
  isNotDeleted,
  notFound,
  softDeleteData,
} from "../helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const crmAccountTools = [
  {
    name: "crm_list_accounts",
    description: "List CRM accounts assigned to the authenticated user",
    schema: z.object({
      ...paginationSchema,
    }),
    async handler(args: { limit: number; offset: number }, userId: string) {
      const where = { assigned_to: userId, ...isNotDeleted() };
      const [data, total] = await Promise.all([
        (await supabaseAdmin.from("crm_Accounts").select("*").order("createdAt", { ascending: false })).data,
        (await supabaseAdmin.from("crm_Accounts").select("*", { count: 'exact', head: true })).count,
      ]);
      return listResponse(data, total, args.offset);
    },
  },
  {
    name: "crm_get_account",
    description: "Get a single CRM account by ID",
    schema: z.object({ id: z.string().uuid() }),
    async handler(args: { id: string }, userId: string) {
      const account = (await supabaseAdmin.from("crm_Accounts").select("*").eq("id", args.id).eq("assigned_to", userId).single()).data;
      if (!account) notFound("Account");
      return itemResponse(account);
    },
  },
  {
    name: "crm_search_accounts",
    description: "Search accounts by name or website (substring match)",
    schema: z.object({
      query: z.string().min(1),
      ...paginationSchema,
    }),
    async handler(
      args: { query: string; limit: number; offset: number },
      userId: string
    ) {
      const where = {
        assigned_to: userId,
        ...isNotDeleted(),
        OR: [ilike("name", args.query), ilike("website", args.query)],
      };
      const [data, total] = await Promise.all([
        (await supabaseAdmin.from("crm_Accounts").select("*").order("createdAt", { ascending: false })).data,
        (await supabaseAdmin.from("crm_Accounts").select("*", { count: 'exact', head: true })).count,
      ]);
      return listResponse(data, total, args.offset);
    },
  },
  {
    name: "crm_create_account",
    description: "Create a new CRM account",
    schema: z.object({
      name: z.string().min(1),
      email: z.string().email().optional(),
      description: z.string().optional(),
      office_phone: z.string().optional(),
      website: z.string().optional(),
    }),
    async handler(
      args: {
        name: string;
        email?: string;
        description?: string;
        office_phone?: string;
        website?: string;
      },
      userId: string
    ) {
      const { name, ...rest } = args;
      const account = (await supabaseAdmin.from("crm_Accounts").insert({
                      v: 0,
                      name,
                      ...rest,
                      assigned_to: userId,
                      createdBy: userId,
                      updatedBy: userId,
                      status: "Active",
                    }).select("*").single()).data;
      return itemResponse(account);
    },
  },
  {
    name: "crm_update_account",
    description: "Update an existing CRM account by ID",
    schema: z.object({
      id: z.string().uuid(),
      name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      description: z.string().optional(),
      office_phone: z.string().optional(),
      website: z.string().optional(),
    }),
    async handler(
      args: {
        id: string;
        name?: string;
        email?: string;
        description?: string;
        office_phone?: string;
        website?: string;
      },
      userId: string
    ) {
      const existing = (await supabaseAdmin.from("crm_Accounts").select("*").eq("id", args.id).eq("assigned_to", userId).single()).data;
      if (!existing) notFound("Account");
      const { id, ...updateData } = args;
      const account = (await supabaseAdmin.from("crm_Accounts").update({ ...updateData, updatedBy: userId }).select("*").single().eq("id", id).select("*").single()).data;
      return itemResponse(account);
    },
  },
  {
    name: "crm_delete_account",
    description: "Soft-delete a CRM account by ID (sets deletedAt timestamp)",
    schema: z.object({ id: z.string().uuid() }),
    async handler(args: { id: string }, userId: string) {
      const existing = (await supabaseAdmin.from("crm_Accounts").select("*").eq("id", args.id).eq("assigned_to", userId).single()).data;
      if (!existing) notFound("Account");
      const account = (await supabaseAdmin.from("crm_Accounts").update(softDeleteData(userId)).eq("id", args.id).select("*").single()).data;
      return itemResponse({ id: account.id, deletedAt: account.deletedAt });
    },
  },
];
