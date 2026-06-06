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

export const crmTargetListTools = [
  {
    name: "crm_list_target_lists",
    description: "List target lists (org-wide)",
    schema: z.object({ ...paginationSchema }),
    async handler(args: { limit: number; offset: number }, _userId: string) {
      const where = { deletedAt: null };
      const [data, total] = await Promise.all([
        (await supabaseAdmin.from("crm_TargetLists").select("*, _count(targets)").order("created_on", { ascending: false })).data,
        (await supabaseAdmin.from("crm_TargetLists").select("*", { count: 'exact', head: true })).count,
      ]);
      return listResponse(data, total, args.offset);
    },
  },
  {
    name: "crm_get_target_list",
    description: "Get a target list by ID with its members",
    schema: z.object({
      id: z.string().uuid(),
      ...paginationSchema,
    }),
    async handler(
      args: { id: string; limit: number; offset: number },
      _userId: string
    ) {
      const tl = (await supabaseAdmin.from("crm_TargetLists").select("*, targets(*, target), _count(targets)").eq("id", args.id).is("deletedAt", null).single()).data;
      if (!tl) notFound("TargetList");
      return itemResponse(tl);
    },
  },
  {
    name: "crm_create_target_list",
    description: "Create a new target list",
    schema: z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    }),
    async handler(args: { name: string; description?: string }, userId: string) {
      const tl = (await supabaseAdmin.from("crm_TargetLists").insert({ name: args.name, description: args.description, created_by: userId }).select("*").single()).data;
      return itemResponse(tl);
    },
  },
  {
    name: "crm_update_target_list",
    description: "Update a target list by ID",
    schema: z.object({
      id: z.string().uuid(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
    }),
    async handler(
      args: { id: string; name?: string; description?: string },
      _userId: string
    ) {
      const existing = (await supabaseAdmin.from("crm_TargetLists").select("*").eq("id", args.id).is("deletedAt", null).single()).data;
      if (!existing) notFound("TargetList");
      const { id, ...updateData } = args;
      const tl = (await supabaseAdmin.from("crm_TargetLists").update(updateData).select("*").single()).data;
      return itemResponse(tl);
    },
  },
  {
    name: "crm_delete_target_list",
    description: "Soft-delete a target list (sets deletedAt timestamp)",
    schema: z.object({ id: z.string().uuid() }),
    async handler(args: { id: string }, _userId: string) {
      const existing = (await supabaseAdmin.from("crm_TargetLists").select("*").eq("id", args.id).is("deletedAt", null).single()).data;
      if (!existing) notFound("TargetList");
      const tl = (await supabaseAdmin.from("crm_TargetLists").update(softDeleteData(_userId)).eq("id", args.id).select("*").single()).data;
      return itemResponse({ id: tl.id, deletedAt: tl.deletedAt });
    },
  },
  {
    name: "crm_add_to_target_list",
    description: "Add one or more targets to a target list",
    schema: z.object({
      target_list_id: z.string().uuid(),
      target_ids: z.array(z.string().uuid()).min(1).max(100),
    }),
    async handler(
      args: { target_list_id: string; target_ids: string[] },
      _userId: string
    ) {
      const tl = (await supabaseAdmin.from("crm_TargetLists").select("*").eq("id", args.target_list_id).is("deletedAt", null).single()).data;
      if (!tl) notFound("TargetList");
      await supabaseAdmin.from("TargetsToTargetLists").insert(
        args.target_ids.map((tid) => ({
          target_id: tid,
          target_list_id: args.target_list_id,
        }))
      );
      return itemResponse({
        target_list_id: args.target_list_id,
        added: args.target_ids.length,
      });
    },
  },
  {
    name: "crm_remove_from_target_list",
    description: "Remove one or more targets from a target list",
    schema: z.object({
      target_list_id: z.string().uuid(),
      target_ids: z.array(z.string().uuid()).min(1).max(100),
    }),
    async handler(
      args: { target_list_id: string; target_ids: string[] },
      _userId: string
    ) {
      (await supabaseAdmin.from("TargetsToTargetLists").delete().select("*").single().eq("target_list_id", args.target_list_id).in("target_id", args.target_ids)).data;
      return itemResponse({
        target_list_id: args.target_list_id,
        removed: args.target_ids.length,
      });
    },
  },
];
