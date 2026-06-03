import { z } from "zod";

import {
  paginationSchema,
  paginationArgs,
  listResponse,
  itemResponse,
  notFound,
} from "../helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const crmProductTools = [
  {
    name: "crm_list_products",
    description: "List CRM products (org-wide catalog)",
    schema: z.object({
      status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
      ...paginationSchema,
    }),
    async handler(
      args: { status?: string; limit: number; offset: number },
      _userId: string
    ) {
      const where = {
        deletedAt: null,
        ...(args.status && { status: args.status as any }),
      };
      const [data, total] = await Promise.all([
        (await supabaseAdmin.from("crm_Products").select("*, category").order("createdAt", { ascending: false })).data,
        (await supabaseAdmin.from("crm_Products").select("*", { count: 'exact', head: true })).count,
      ]);
      return listResponse(data, total, args.offset);
    },
  },
  {
    name: "crm_get_product",
    description: "Get a single CRM product by ID",
    schema: z.object({ id: z.string().uuid() }),
    async handler(args: { id: string }, _userId: string) {
      const product = (await supabaseAdmin.from("crm_Products").select("*, category").eq("id", args.id).eq("deletedAt", null).single()).data;
      if (!product) notFound("Product");
      return itemResponse(product);
    },
  },
  {
    name: "crm_create_product",
    description: "Create a new CRM product",
    schema: z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      sku: z.string().optional(),
      type: z.enum(["PRODUCT", "SERVICE"]),
      unit_price: z.number().min(0),
      unit_cost: z.number().min(0).optional(),
      currency: z.string().length(3),
      tax_rate: z.number().min(0).max(100).optional(),
      unit: z.string().optional(),
      is_recurring: z.boolean().optional(),
      billing_period: z.enum(["MONTHLY", "QUARTERLY", "SEMIANNUALLY", "ANNUALLY"]).optional(),
      categoryId: z.string().uuid().optional(),
    }),
    async handler(
      args: {
        name: string;
        description?: string;
        sku?: string;
        type: string;
        unit_price: number;
        unit_cost?: number;
        currency: string;
        tax_rate?: number;
        unit?: string;
        is_recurring?: boolean;
        billing_period?: string;
        categoryId?: string;
      },
      userId: string
    ) {
      const product = (await supabaseAdmin.from("crm_Products").insert({
                      name: args.name,
                      description: args.description,
                      sku: args.sku,
                      type: args.type as any,
                      status: "DRAFT",
                      unit_price: args.unit_price,
                      unit_cost: args.unit_cost,
                      currency: args.currency,
                      tax_rate: args.tax_rate,
                      unit: args.unit,
                      is_recurring: args.is_recurring ?? false,
                      billing_period: args.billing_period as any,
                      categoryId: args.categoryId,
                      createdBy: userId,
                      updatedBy: userId,
                    }).select("*").single()).data;
      return itemResponse(product);
    },
  },
  {
    name: "crm_update_product",
    description: "Update an existing CRM product by ID",
    schema: z.object({
      id: z.string().uuid(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      sku: z.string().optional(),
      type: z.enum(["PRODUCT", "SERVICE"]).optional(),
      status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
      unit_price: z.number().min(0).optional(),
      unit_cost: z.number().min(0).optional(),
      currency: z.string().length(3).optional(),
      tax_rate: z.number().min(0).max(100).optional(),
      unit: z.string().optional(),
      is_recurring: z.boolean().optional(),
      billing_period: z.enum(["MONTHLY", "QUARTERLY", "SEMIANNUALLY", "ANNUALLY"]).optional(),
      categoryId: z.string().uuid().optional(),
    }),
    async handler(args: Record<string, any>, userId: string) {
      const existing = (await supabaseAdmin.from("crm_Products").select("*").eq("id", args.id).eq("deletedAt", null).single()).data;
      if (!existing) notFound("Product");
      const { id, ...updateData } = args;
      const product = (await supabaseAdmin.from("crm_Products").update({ ...updateData, updatedBy: userId }).select("*").single().eq("id", id).select("*").single()).data;
      return itemResponse(product);
    },
  },
  {
    name: "crm_delete_product",
    description: "Soft-delete a CRM product (sets deletedAt timestamp)",
    schema: z.object({ id: z.string().uuid() }),
    async handler(args: { id: string }, userId: string) {
      const existing = (await supabaseAdmin.from("crm_Products").select("*").eq("id", args.id).eq("deletedAt", null).single()).data;
      if (!existing) notFound("Product");
      const product = (await supabaseAdmin.from("crm_Products").update({ deletedAt: new Date(), deletedBy: userId, status: "ARCHIVED" as any }).select("*").single().eq("id", args.id).select("*").single()).data;
      return itemResponse({ id: product.id, status: "ARCHIVED" });
    },
  },
];
