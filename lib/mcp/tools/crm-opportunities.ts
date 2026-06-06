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

export const crmOpportunityTools = [
  {
    name: "crm_list_opportunities",
    description: "List CRM opportunities assigned to the authenticated user",
    schema: z.object({ ...paginationSchema }),
    async handler(args: { limit: number; offset: number }, userId: string) {
      const where = { assigned_to: userId, deletedAt: null };
      const [data, total] = await Promise.all([
        (await supabaseAdmin.from("crm_Opportunities").select("*").order("createdAt", { ascending: false })).data,
        (await supabaseAdmin.from("crm_Opportunities").select("*", { count: 'exact', head: true })).count,
      ]);
      return listResponse(data, total, args.offset);
    },
  },
  {
    name: "crm_get_opportunity",
    description: "Get a single CRM opportunity by ID",
    schema: z.object({ id: z.string().uuid() }),
    async handler(args: { id: string }, userId: string) {
      const opp = (await supabaseAdmin.from("crm_Opportunities").select("*").eq("id", args.id).eq("assigned_to", userId).is("deletedAt", null).single()).data;
      if (!opp) notFound("Opportunity");
      return itemResponse(opp);
    },
  },
  {
    name: "crm_search_opportunities",
    description: "Search opportunities by name or description (substring match)",
    schema: z.object({ query: z.string().min(1), ...paginationSchema }),
    async handler(
      args: { query: string; limit: number; offset: number },
      userId: string
    ) {
      const where = {
        assigned_to: userId,
        deletedAt: null,
        OR: [ilike("name", args.query), ilike("description", args.query)],
      };
      const [data, total] = await Promise.all([
        (await supabaseAdmin.from("crm_Opportunities").select("*").order("createdAt", { ascending: false })).data,
        (await supabaseAdmin.from("crm_Opportunities").select("*", { count: 'exact', head: true })).count,
      ]);
      return listResponse(data, total, args.offset);
    },
  },
  {
    name: "crm_create_opportunity",
    description: "Create a new CRM opportunity",
    schema: z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      close_date: z.string().datetime().optional(),
      budget: z.number().int().min(0).optional(),
      expected_revenue: z.number().int().min(0).optional(),
      currency: z.string().optional(),
      next_step: z.string().optional(),
    }),
    async handler(
      args: {
        name: string;
        description?: string;
        close_date?: string;
        budget?: number;
        expected_revenue?: number;
        currency?: string;
        next_step?: string;
      },
      userId: string
    ) {
      const { name, budget, expected_revenue, close_date, ...rest } = args;
      const opp = (await supabaseAdmin.from("crm_Opportunities").insert({
                      v: 0,
                      name,
                      ...rest,
                      ...(budget !== undefined && { budget }),
                      ...(expected_revenue !== undefined && { expected_revenue }),
                      ...(close_date !== undefined && { close_date: new Date(close_date) }),
                      assigned_to: userId,
                      createdBy: userId,
                      updatedBy: userId,
                    }).select("*").single()).data;
      return itemResponse(opp);
    },
  },
  {
    name: "crm_update_opportunity",
    description: "Update an existing CRM opportunity by ID",
    schema: z.object({
      id: z.string().uuid(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      close_date: z.string().datetime().optional(),
      budget: z.number().int().min(0).optional(),
      expected_revenue: z.number().int().min(0).optional(),
      currency: z.string().optional(),
      next_step: z.string().optional(),
    }),
    async handler(
      args: {
        id: string;
        name?: string;
        description?: string;
        close_date?: string;
        budget?: number;
        expected_revenue?: number;
        currency?: string;
        next_step?: string;
      },
      userId: string
    ) {
      const existing = (await supabaseAdmin.from("crm_Opportunities").select("*").eq("id", args.id).eq("assigned_to", userId).is("deletedAt", null).single()).data;
      if (!existing) notFound("Opportunity");
      const { id, budget, expected_revenue, close_date, currency, ...rest } = args;
      const opp = (await supabaseAdmin.from("crm_Opportunities").update({
                      ...rest,
                      ...(currency !== undefined && { currency }),
                      ...(budget !== undefined && { budget }),
                      ...(expected_revenue !== undefined && { expected_revenue }),
                      ...(close_date !== undefined && { close_date: new Date(close_date) }),
                      updatedBy: userId,
                    }).select("*").single().eq("id", id).select("*").single()).data;
      return itemResponse(opp);
    },
  },
  {
    name: "crm_delete_opportunity",
    description: "Soft-delete a CRM opportunity by ID",
    schema: z.object({ id: z.string().uuid() }),
    async handler(args: { id: string }, userId: string) {
      const existing = (await supabaseAdmin.from("crm_Opportunities").select("*").eq("id", args.id).eq("assigned_to", userId).is("deletedAt", null).single()).data;
      if (!existing) notFound("Opportunity");
      const opp = (await supabaseAdmin.from("crm_Opportunities").update(softDeleteData(userId)).eq("id", args.id).select("*").single()).data;
      return itemResponse({ id: opp.id, deletedAt: opp.deletedAt });
    },
  },
];
