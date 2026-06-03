import { z } from "zod";

import {
  paginationSchema,
  paginationArgs,
  listResponse,
  itemResponse,
  ilike,
  notFound,
  softDeleteData,
} from "../helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const crmLeadTools = [
  {
    name: "crm_list_leads",
    description: "List CRM leads assigned to the authenticated user",
    schema: z.object({ ...paginationSchema }),
    async handler(args: { limit: number; offset: number }, userId: string) {
      const where = { assigned_to: userId, deletedAt: null };
      const [data, total] = await Promise.all([
        (await supabaseAdmin.from("crm_Leads").select("*").order("createdAt", { ascending: false })).data,
        (await supabaseAdmin.from("crm_Leads").select("*", { count: 'exact', head: true })).count,
      ]);
      return listResponse(data, total, args.offset);
    },
  },
  {
    name: "crm_get_lead",
    description: "Get a single CRM lead by ID",
    schema: z.object({ id: z.string().uuid() }),
    async handler(args: { id: string }, userId: string) {
      const lead = (await supabaseAdmin.from("crm_Leads").select("*").eq("id", args.id).eq("assigned_to", userId).eq("deletedAt", null).single()).data;
      if (!lead) notFound("Lead");
      return itemResponse(lead);
    },
  },
  {
    name: "crm_search_leads",
    description: "Search leads by name, company, or email (substring match)",
    schema: z.object({ query: z.string().min(1), ...paginationSchema }),
    async handler(
      args: { query: string; limit: number; offset: number },
      userId: string
    ) {
      const where = {
        assigned_to: userId,
        deletedAt: null,
        OR: [
          ilike("firstName", args.query),
          ilike("lastName", args.query),
          ilike("email", args.query),
          ilike("company", args.query),
        ],
      };
      const [data, total] = await Promise.all([
        (await supabaseAdmin.from("crm_Leads").select("*").order("createdAt", { ascending: false })).data,
        (await supabaseAdmin.from("crm_Leads").select("*", { count: 'exact', head: true })).count,
      ]);
      return listResponse(data, total, args.offset);
    },
  },
  {
    name: "crm_create_lead",
    description: "Create a new CRM lead",
    schema: z.object({
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1),
      email: z.string().email().optional(),
      company: z.string().optional(),
      phone: z.string().optional(),
      jobTitle: z.string().optional(),
    }),
    async handler(
      args: {
        firstName?: string;
        lastName: string;
        email?: string;
        company?: string;
        phone?: string;
        jobTitle?: string;
      },
      userId: string
    ) {
      const { lastName, ...rest } = args;
      const lead = (await supabaseAdmin.from("crm_Leads").insert({ v: 0, lastName, ...rest, assigned_to: userId, createdBy: userId }).select("*").single()).data;
      return itemResponse(lead);
    },
  },
  {
    name: "crm_update_lead",
    description: "Update an existing CRM lead by ID",
    schema: z.object({
      id: z.string().uuid(),
      firstName: z.string().min(1).optional(),
      lastName: z.string().min(1).optional(),
      email: z.string().email().optional(),
      company: z.string().optional(),
      phone: z.string().optional(),
      jobTitle: z.string().optional(),
    }),
    async handler(
      args: {
        id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        company?: string;
        phone?: string;
        jobTitle?: string;
      },
      userId: string
    ) {
      const existing = (await supabaseAdmin.from("crm_Leads").select("*").eq("id", args.id).eq("assigned_to", userId).eq("deletedAt", null).single()).data;
      if (!existing) notFound("Lead");
      const { id, ...updateData } = args;
      const lead = (await supabaseAdmin.from("crm_Leads").update({ ...updateData, updatedBy: userId }).select("*").single().eq("id", id).select("*").single()).data;
      return itemResponse(lead);
    },
  },
  {
    name: "crm_delete_lead",
    description: "Soft-delete a CRM lead by ID (sets deletedAt timestamp)",
    schema: z.object({ id: z.string().uuid() }),
    async handler(args: { id: string }, userId: string) {
      const existing = (await supabaseAdmin.from("crm_Leads").select("*").eq("id", args.id).eq("assigned_to", userId).eq("deletedAt", null).single()).data;
      if (!existing) notFound("Lead");
      const lead = (await supabaseAdmin.from("crm_Leads").update(softDeleteData(userId)).eq("id", args.id).select("*").single()).data;
      return itemResponse({ id: lead.id, deletedAt: lead.deletedAt });
    },
  },
];
