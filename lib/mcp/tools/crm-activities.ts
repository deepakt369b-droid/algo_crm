import { z } from "zod";

import {
  paginationSchema,
  paginationArgs,
  listResponse,
  itemResponse,
  notFound,
  softDeleteData,
} from "../helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";

const entityLinkSchema = z.object({
  entityType: z.enum(["account", "contact", "lead", "opportunity", "contract"]),
  entityId: z.string().uuid(),
});

export const crmActivityTools = [
  {
    name: "crm_list_activities",
    description:
      "List CRM activities created by the authenticated user, optionally filtered by linked entity",
    schema: z.object({
      type: z.enum(["call", "meeting", "note", "email"]).optional(),
      status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
      entityType: z.string().optional(),
      entityId: z.string().uuid().optional(),
      ...paginationSchema,
    }),
    async handler(
      args: {
        type?: string;
        status?: string;
        entityType?: string;
        entityId?: string;
        limit: number;
        offset: number;
      },
      userId: string
    ) {
      const where: any = {
        createdBy: userId,
        deletedAt: null,
        ...(args.type && { type: args.type as any }),
        ...(args.status && { status: args.status as any }),
        ...(args.entityType &&
          args.entityId && {
            links: {
              some: { entityType: args.entityType, entityId: args.entityId },
            },
          }),
      };
      const [data, total] = await Promise.all([
        (await supabaseAdmin.from("crm_Activities").select("*, links").order("date", { ascending: false })).data,
        (await supabaseAdmin.from("crm_Activities").select("*", { count: 'exact', head: true })).count,
      ]);
      return listResponse(data, total, args.offset);
    },
  },
  {
    name: "crm_get_activity",
    description: "Get a single CRM activity by ID with entity links",
    schema: z.object({ id: z.string().uuid() }),
    async handler(args: { id: string }, userId: string) {
      const activity = (await supabaseAdmin.from("crm_Activities").select("*, links").eq("id", args.id).eq("createdBy", userId).is("deletedAt", null).single()).data;
      if (!activity) notFound("Activity");
      return itemResponse(activity);
    },
  },
  {
    name: "crm_create_activity",
    description: "Create a CRM activity (call/meeting/note/email) and link to entities",
    schema: z.object({
      type: z.enum(["call", "meeting", "note", "email"]),
      title: z.string().min(1),
      description: z.string().optional(),
      date: z.string().datetime(),
      duration: z.number().int().min(0).optional(),
      outcome: z.string().optional(),
      status: z.enum(["scheduled", "completed", "cancelled"]).default("scheduled"),
      links: z.array(entityLinkSchema).optional(),
    }),
    async handler(
      args: {
        type: string;
        title: string;
        description?: string;
        date: string;
        duration?: number;
        outcome?: string;
        status: string;
        links?: Array<{ entityType: string; entityId: string }>;
      },
      userId: string
    ) {
      const { links, date, ...rest } = args;
      const activity = (await supabaseAdmin.from("crm_Activities").insert({
                ...rest,
                type: rest.type as any,
                status: rest.status as any,
                date: new Date(date),
                createdBy: userId,
                updatedBy: userId,
                ...(links?.length && {
                  links: {
                    createMany: {
                      data: links.map((l) => ({
                        entityType: l.entityType,
                        entityId: l.entityId,
                      })),
                    },
                  },
                }),
              }).select("*").single()).data;
      return itemResponse(activity);
    },
  },
  {
    name: "crm_update_activity",
    description: "Update an existing CRM activity by ID",
    schema: z.object({
      id: z.string().uuid(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      date: z.string().datetime().optional(),
      duration: z.number().int().min(0).optional(),
      outcome: z.string().optional(),
      status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
    }),
    async handler(
      args: {
        id: string;
        title?: string;
        description?: string;
        date?: string;
        duration?: number;
        outcome?: string;
        status?: string;
      },
      userId: string
    ) {
      const existing = (await supabaseAdmin.from("crm_Activities").select("*").eq("id", args.id).eq("createdBy", userId).is("deletedAt", null).single()).data;
      if (!existing) notFound("Activity");
      const { id, date, status, ...rest } = args;
      const activity = (await supabaseAdmin.from("crm_Activities").update({
                      ...rest,
                      ...(date !== undefined && { date: new Date(date) }),
                      ...(status !== undefined && { status: status as any }),
                      updatedBy: userId,
                    }).select("*").single().eq("id", id).select("*").single()).data;
      return itemResponse(activity);
    },
  },
  {
    name: "crm_delete_activity",
    description: "Soft-delete a CRM activity by ID (sets deletedAt timestamp)",
    schema: z.object({ id: z.string().uuid() }),
    async handler(args: { id: string }, userId: string) {
      const existing = (await supabaseAdmin.from("crm_Activities").select("*").eq("id", args.id).eq("createdBy", userId).is("deletedAt", null).single()).data;
      if (!existing) notFound("Activity");
      const activity = (await supabaseAdmin.from("crm_Activities").update(softDeleteData(userId)).eq("id", args.id).select("*").single()).data;
      return itemResponse({ id: activity.id, deletedAt: activity.deletedAt });
    },
  },
];
