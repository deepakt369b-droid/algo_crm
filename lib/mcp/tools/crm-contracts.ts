import { z } from "zod";

import {
  paginationSchema,
  paginationArgs,
  listResponse,
  itemResponse,
  notFound,
} from "../helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";

const lineItemSchema = z.object({
  productId: z.string().uuid().optional(),
  name: z.string().min(1),
  sku: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
  unit_price: z.number().min(0),
  discount_type: z.enum(["PERCENTAGE", "FIXED"]).default("PERCENTAGE"),
  discount_value: z.number().min(0).default(0),
  line_total: z.number().min(0),
  currency: z.string().length(3),
  sort_order: z.number().int().default(0),
});

export const crmContractTools = [
  {
    name: "crm_list_contracts",
    description: "List CRM contracts (org-wide)",
    schema: z.object({
      status: z.enum(["NOTSTARTED", "INPROGRESS", "SIGNED"]).optional(),
      account: z.string().uuid().optional(),
      ...paginationSchema,
    }),
    async handler(
      args: { status?: string; account?: string; limit: number; offset: number },
      _userId: string
    ) {
      const where = {
        deletedAt: null,
        ...(args.status && { status: args.status as any }),
        ...(args.account && { account: args.account }),
      };
      const [data, total] = await Promise.all([
        (await supabaseAdmin.from("crm_Contracts").select("*, lineItems, assigned_account(id, name)").order("createdAt", { ascending: false })).data,
        (await supabaseAdmin.from("crm_Contracts").select("*", { count: 'exact', head: true })).count,
      ]);
      return listResponse(data, total, args.offset);
    },
  },
  {
    name: "crm_get_contract",
    description: "Get a single CRM contract by ID with line items",
    schema: z.object({ id: z.string().uuid() }),
    async handler(args: { id: string }, _userId: string) {
      const contract = (await supabaseAdmin.from("crm_Contracts").select("*").eq("id", args.id).eq("deletedAt", null).single()).data;
      if (!contract) notFound("Contract");
      return itemResponse(contract);
    },
  },
  {
    name: "crm_create_contract",
    description: "Create a new CRM contract with optional line items",
    schema: z.object({
      title: z.string().min(1),
      value: z.number().min(0),
      description: z.string().optional(),
      account: z.string().uuid().optional(),
      assigned_to: z.string().uuid().optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      type: z.string().optional(),
      currency: z.string().length(3).optional(),
      lineItems: z.array(lineItemSchema).optional(),
    }),
    async handler(args: Record<string, any>, userId: string) {
      const { lineItems, startDate, endDate, ...contractData } = args;
      const contract = (await supabaseAdmin.from("crm_Contracts").insert({
                v: 0,
                ...contractData,
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate && { endDate: new Date(endDate) }),
                createdBy: userId,
                updatedBy: userId,
                ...(lineItems?.length && {
                  lineItems: {
                    create: lineItems.map((li: any) => ({
                      ...li,
                      createdBy: userId,
                    })),
                  },
                }),
              }).select("*").single()).data;
      return itemResponse(contract);
    },
  },
  {
    name: "crm_update_contract",
    description:
      "Update an existing CRM contract by ID (does not modify line items — use separate operations)",
    schema: z.object({
      id: z.string().uuid(),
      title: z.string().min(1).optional(),
      value: z.number().min(0).optional(),
      description: z.string().optional(),
      account: z.string().uuid().optional(),
      assigned_to: z.string().uuid().optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      status: z.enum(["NOTSTARTED", "INPROGRESS", "SIGNED"]).optional(),
      type: z.string().optional(),
      currency: z.string().length(3).optional(),
    }),
    async handler(args: Record<string, any>, userId: string) {
      const existing = (await supabaseAdmin.from("crm_Contracts").select("*").eq("id", args.id).eq("deletedAt", null).single()).data;
      if (!existing) notFound("Contract");
      const { id, startDate, endDate, ...rest } = args;
      const contract = (await supabaseAdmin.from("crm_Contracts").update({
                      ...rest,
                      ...(startDate !== undefined && { startDate: new Date(startDate) }),
                      ...(endDate !== undefined && { endDate: new Date(endDate) }),
                      updatedBy: userId,
                    }).select("*").single().eq("id", id).select("*").single()).data;
      return itemResponse(contract);
    },
  },
  {
    name: "crm_delete_contract",
    description: "Soft-delete a CRM contract (sets deletedAt timestamp)",
    schema: z.object({ id: z.string().uuid() }),
    async handler(args: { id: string }, userId: string) {
      const existing = (await supabaseAdmin.from("crm_Contracts").select("*").eq("id", args.id).eq("deletedAt", null).single()).data;
      if (!existing) notFound("Contract");
      const contract = (await supabaseAdmin.from("crm_Contracts").update({ deletedAt: new Date(), deletedBy: userId }).select("*").single().eq("id", args.id).select("*").single()).data;
      return itemResponse({ id: contract.id, status: "DELETED" });
    },
  },
];
