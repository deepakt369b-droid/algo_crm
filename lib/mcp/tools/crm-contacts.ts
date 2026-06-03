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

export const crmContactTools = [
  {
    name: "crm_list_contacts",
    description: "List CRM contacts assigned to the authenticated user",
    schema: z.object({ ...paginationSchema }),
    async handler(args: { limit: number; offset: number }, userId: string) {
      const where = { assigned_to: userId, deletedAt: null };
      const [data, total] = await Promise.all([
        (await supabaseAdmin.from("crm_Contacts").select("*").order("created_on", { ascending: false })).data,
        (await supabaseAdmin.from("crm_Contacts").select("*", { count: 'exact', head: true })).count,
      ]);
      return listResponse(data, total, args.offset);
    },
  },
  {
    name: "crm_get_contact",
    description: "Get a single CRM contact by ID",
    schema: z.object({ id: z.string().uuid() }),
    async handler(args: { id: string }, userId: string) {
      const contact = (await supabaseAdmin.from("crm_Contacts").select("*").eq("id", args.id).eq("assigned_to", userId).eq("deletedAt", null).single()).data;
      if (!contact) notFound("Contact");
      return itemResponse(contact);
    },
  },
  {
    name: "crm_search_contacts",
    description: "Search contacts by name, email, or phone (substring match)",
    schema: z.object({ query: z.string().min(1), ...paginationSchema }),
    async handler(
      args: { query: string; limit: number; offset: number },
      userId: string
    ) {
      const where = {
        assigned_to: userId,
        deletedAt: null,
        OR: [
          ilike("first_name", args.query),
          ilike("last_name", args.query),
          ilike("email", args.query),
          ilike("office_phone", args.query),
          ilike("mobile_phone", args.query),
        ],
      };
      const [data, total] = await Promise.all([
        (await supabaseAdmin.from("crm_Contacts").select("*").order("created_on", { ascending: false })).data,
        (await supabaseAdmin.from("crm_Contacts").select("*", { count: 'exact', head: true })).count,
      ]);
      return listResponse(data, total, args.offset);
    },
  },
  {
    name: "crm_create_contact",
    description: "Create a new CRM contact",
    schema: z.object({
      first_name: z.string().min(1).optional(),
      last_name: z.string().min(1),
      email: z.string().email().optional(),
      office_phone: z.string().optional(),
      mobile_phone: z.string().optional(),
      position: z.string().optional(),
    }),
    async handler(
      args: {
        first_name?: string;
        last_name: string;
        email?: string;
        office_phone?: string;
        mobile_phone?: string;
        position?: string;
      },
      userId: string
    ) {
      const { last_name, ...rest } = args;
      const contact = (await supabaseAdmin.from("crm_Contacts").insert({
                      v: 0,
                      last_name,
                      ...rest,
                      assigned_to: userId,
                      createdBy: userId,
                      updatedBy: userId,
                    }).select("*").single()).data;
      return itemResponse(contact);
    },
  },
  {
    name: "crm_update_contact",
    description: "Update an existing CRM contact by ID",
    schema: z.object({
      id: z.string().uuid(),
      first_name: z.string().min(1).optional(),
      last_name: z.string().min(1).optional(),
      email: z.string().email().optional(),
      office_phone: z.string().optional(),
      mobile_phone: z.string().optional(),
      position: z.string().optional(),
    }),
    async handler(
      args: {
        id: string;
        first_name?: string;
        last_name?: string;
        email?: string;
        office_phone?: string;
        mobile_phone?: string;
        position?: string;
      },
      userId: string
    ) {
      const existing = (await supabaseAdmin.from("crm_Contacts").select("*").eq("id", args.id).eq("assigned_to", userId).eq("deletedAt", null).single()).data;
      if (!existing) notFound("Contact");
      const { id, ...updateData } = args;
      const contact = (await supabaseAdmin.from("crm_Contacts").update({ ...updateData, updatedBy: userId }).select("*").single().eq("id", id).select("*").single()).data;
      return itemResponse(contact);
    },
  },
  {
    name: "crm_delete_contact",
    description: "Soft-delete a CRM contact by ID (sets deletedAt timestamp)",
    schema: z.object({ id: z.string().uuid() }),
    async handler(args: { id: string }, userId: string) {
      const existing = (await supabaseAdmin.from("crm_Contacts").select("*").eq("id", args.id).eq("assigned_to", userId).eq("deletedAt", null).single()).data;
      if (!existing) notFound("Contact");
      const contact = (await supabaseAdmin.from("crm_Contacts").update(softDeleteData(userId)).eq("id", args.id).select("*").single()).data;
      return itemResponse({ id: contact.id, deletedAt: contact.deletedAt });
    },
  },
];
