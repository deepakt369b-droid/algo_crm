import { z } from "zod";
import {
  paginationSchema,
  paginationArgs,
  listResponse,
  itemResponse,
  notFound,
  conflict,
  softDeleteData,
} from "../helpers";
import { supabaseAdmin } from "@/lib/supabase-admin";

function userBoardWhere(userId: string) {
  return {
    deletedAt: null,
    OR: [
      { user: userId },
      { sharedWith: { has: userId } },
    ],
  };
}

export const projectTools = [
  // ── Boards ────────────────────────────────────────────
  {
    name: "projects_list_boards",
    description: "List project boards the user owns or is shared with",
    schema: z.object({ ...paginationSchema }),
    async handler(args: { limit: number; offset: number }, userId: string) {
      const { data, count: total } = await supabaseAdmin.from("boards")
        .select("*, sections(count)", { count: "exact" })
        .or(`user.eq.${userId},sharedWith.cs.{${userId}}`)
        .is("deletedAt", null)
        .order("createdAt", { ascending: false })
        .range(args.offset, args.offset + args.limit - 1);
      return listResponse(data || [], total || 0, args.offset);
    },
  },
  {
    name: "projects_get_board",
    description: "Get a project board with its sections and tasks",
    schema: z.object({ id: z.string().uuid() }),
    async handler(args: { id: string }, userId: string) {
      const board = (await supabaseAdmin.from("boards")
        .select("*, sections(*, tasks(*)), watchers(*)")
        .eq("id", args.id)
        .or(`user.eq.${userId},sharedWith.cs.{${userId}}`)
        .is("deletedAt", null)
        .single()).data;
      if (!board) notFound("Board");
      return itemResponse(board);
    },
  },
  {
    name: "projects_create_board",
    description: "Create a new project board",
    schema: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      icon: z.string().optional(),
      visibility: z.string().optional(),
    }),
    async handler(
      args: { title: string; description: string; icon?: string; visibility?: string },
      userId: string
    ) {
      const board = (await supabaseAdmin.from("boards").insert({
        v: 0,
        title: args.title,
        description: args.description,
        icon: args.icon,
        visibility: args.visibility,
        user: userId,
        createdBy: userId,
        updatedBy: userId,
      }).select().single()).data;
      return itemResponse(board);
    },
  },
  {
    name: "projects_update_board",
    description: "Update a project board by ID",
    schema: z.object({
      id: z.string().uuid(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      icon: z.string().optional(),
      visibility: z.string().optional(),
    }),
    async handler(args: Record<string, any>, userId: string) {
      const existing = (await supabaseAdmin.from("boards").select("id")
        .eq("id", args.id)
        .or(`user.eq.${userId},sharedWith.cs.{${userId}}`)
        .is("deletedAt", null)
        .single()).data;
      if (!existing) notFound("Board");
      const { id, ...updateData } = args;
      const board = (await supabaseAdmin.from("boards").update({
        ...updateData, updatedBy: userId
      }).eq("id", id).select().single()).data;
      return itemResponse(board);
    },
  },
  {
    name: "projects_delete_board",
    description: "Soft-delete a project board (sets deletedAt timestamp)",
    schema: z.object({ id: z.string().uuid() }),
    async handler(args: { id: string }, userId: string) {
      const existing = (await supabaseAdmin.from("boards").select("id")
        .eq("id", args.id)
        .or(`user.eq.${userId},sharedWith.cs.{${userId}}`)
        .is("deletedAt", null)
        .single()).data;
      if (!existing) notFound("Board");
      const board = (await supabaseAdmin.from("boards").update(softDeleteData(userId)).eq("id", args.id).select().single()).data;
      return itemResponse({ id: board.id, deletedAt: board.deletedAt });
    },
  },

  // ── Sections ──────────────────────────────────────────
  {
    name: "projects_create_section",
    description: "Add a section (column) to a board",
    schema: z.object({
      board: z.string().uuid(),
      title: z.string().min(1),
    }),
    async handler(args: { board: string; title: string }, userId: string) {
      const board = (await supabaseAdmin.from("boards").select("id")
        .eq("id", args.board)
        .or(`user.eq.${userId},sharedWith.cs.{${userId}}`)
        .is("deletedAt", null)
        .single()).data;
      if (!board) notFound("Board");
      const maxPosResult = await supabaseAdmin.from("sections").select("position").eq("board", args.board).order("position", { ascending: false }).limit(1).single();
      const maxPosition = maxPosResult.data?.position ? BigInt(maxPosResult.data.position) : BigInt(0);
      const section = (await supabaseAdmin.from("sections").insert({
        v: 0,
        board: args.board,
        title: args.title,
        position: Number(maxPosition) + 1000,
      }).select().single()).data;
      return itemResponse(section);
    },
  },
  {
    name: "projects_update_section",
    description: "Update a section title or position",
    schema: z.object({
      id: z.string().uuid(),
      title: z.string().min(1).optional(),
      position: z.number().int().optional(),
    }),
    async handler(args: { id: string; title?: string; position?: number }, _userId: string) {
      const existing = (await supabaseAdmin.from("sections").select("id").eq("id", args.id).single()).data;
      if (!existing) notFound("Section");
      const { id, position, ...rest } = args;
      const section = (await supabaseAdmin.from("sections").update({
        ...rest, ...(position !== undefined && { position })
      }).eq("id", id).select().single()).data;
      return itemResponse(section);
    },
  },
  {
    name: "projects_delete_section",
    description: "Delete a section (must be empty — no tasks)",
    schema: z.object({ id: z.string().uuid() }),
    async handler(args: { id: string }, _userId: string) {
      const section = (await supabaseAdmin.from("sections").select("id, tasks(count)").eq("id", args.id).single()).data;
      if (!section) notFound("Section");
      // @ts-ignore
      if (section.tasks && section.tasks[0]?.count > 0) conflict("Cannot delete section with tasks. Move or delete tasks first.");
      await supabaseAdmin.from("sections").delete().eq("id", args.id);
      return itemResponse({ id: args.id, deleted: true });
    },
  },

  // ── Tasks ─────────────────────────────────────────────
  {
    name: "projects_list_tasks",
    description: "List tasks, optionally filtered by board, section, user, or status",
    schema: z.object({
      board: z.string().uuid().optional(),
      section: z.string().uuid().optional(),
      user: z.string().uuid().optional(),
      status: z.enum(["ACTIVE", "PENDING", "COMPLETE"]).optional(),
      ...paginationSchema,
    }),
    async handler(
      args: { board?: string; section?: string; user?: string; status?: string; limit: number; offset: number },
      userId: string
    ) {
      let query = supabaseAdmin.from("tasks").select("*", { count: "exact" });
      if (args.section) query = query.eq("section", args.section);
      if (args.user) query = query.eq("user", args.user);
      if (args.status) query = query.eq("taskStatus", args.status);
      
      const { data, count: total } = await query.order("createdAt", { ascending: false }).range(args.offset, args.offset + args.limit - 1);
      return listResponse(data || [], total || 0, args.offset);
    },
  },
  {
    name: "projects_get_task",
    description: "Get a task by ID with comments and documents",
    schema: z.object({ id: z.string().uuid() }),
    async handler(args: { id: string }, _userId: string) {
      const task = (await supabaseAdmin.from("tasks").select("*, comments(*), documents(*)").eq("id", args.id).single()).data;
      if (!task) notFound("Task");
      return itemResponse(task);
    },
  },
  {
    name: "projects_create_task",
    description: "Create a task in a board section",
    schema: z.object({
      title: z.string().min(1),
      content: z.string().optional(),
      section: z.string().uuid(),
      priority: z.string().default("Normal"),
      dueDateAt: z.string().datetime().optional(),
    }),
    async handler(
      args: { title: string; content?: string; section: string; priority: string; dueDateAt?: string },
      userId: string
    ) {
      const sec = (await supabaseAdmin.from("sections").select("id").eq("id", args.section).single()).data;
      if (!sec) notFound("Section");
      const maxPosResult = await supabaseAdmin.from("tasks").select("position").eq("section", args.section).order("position", { ascending: false }).limit(1).single();
      const maxPosition = maxPosResult.data?.position ? BigInt(maxPosResult.data.position) : BigInt(0);
      const task = (await supabaseAdmin.from("tasks").insert({
        v: 0,
        title: args.title,
        content: args.content,
        section: args.section,
        priority: args.priority,
        position: Number(maxPosition) + 1000,
        user: userId,
        createdBy: userId,
        updatedBy: userId,
        ...(args.dueDateAt && { dueDateAt: new Date(args.dueDateAt).toISOString() }),
      }).select().single()).data;
      return itemResponse(task);
    },
  },
  {
    name: "projects_update_task",
    description: "Update a task by ID",
    schema: z.object({
      id: z.string().uuid(),
      title: z.string().min(1).optional(),
      content: z.string().optional(),
      priority: z.string().optional(),
      dueDateAt: z.string().datetime().optional(),
      taskStatus: z.enum(["ACTIVE", "PENDING", "COMPLETE"]).optional(),
    }),
    async handler(args: Record<string, any>, userId: string) {
      const existing = (await supabaseAdmin.from("tasks").select("id").eq("id", args.id).single()).data;
      if (!existing) notFound("Task");
      const { id, dueDateAt, ...rest } = args;
      const task = (await supabaseAdmin.from("tasks").update({
        ...rest,
        ...(dueDateAt !== undefined && { dueDateAt: new Date(dueDateAt).toISOString() }),
        updatedBy: userId,
      }).eq("id", id).select().single()).data;
      return itemResponse(task);
    },
  },
  {
    name: "projects_move_task",
    description: "Move a task to a different section and/or position",
    schema: z.object({
      id: z.string().uuid(),
      section: z.string().uuid(),
      position: z.number().int().optional(),
    }),
    async handler(args: { id: string; section: string; position?: number }, userId: string) {
      const existing = (await supabaseAdmin.from("tasks").select("id").eq("id", args.id).single()).data;
      if (!existing) notFound("Task");
      const sec = (await supabaseAdmin.from("sections").select("id").eq("id", args.section).single()).data;
      if (!sec) notFound("Section");
      const task = (await supabaseAdmin.from("tasks").update({
        section: args.section,
        ...(args.position !== undefined && { position: args.position }),
        updatedBy: userId,
      }).eq("id", args.id).select().single()).data;
      return itemResponse(task);
    },
  },
  {
    name: "projects_delete_task",
    description: "Soft-delete a task (sets status to COMPLETE)",
    schema: z.object({ id: z.string().uuid() }),
    async handler(args: { id: string }, userId: string) {
      const existing = (await supabaseAdmin.from("tasks").select("id").eq("id", args.id).single()).data;
      if (!existing) notFound("Task");
      const task = (await supabaseAdmin.from("tasks").update({
        taskStatus: "COMPLETE", updatedBy: userId
      }).eq("id", args.id).select().single()).data;
      return itemResponse({ id: task.id, status: "COMPLETE" });
    },
  },

  // ── Comments ──────────────────────────────────────────
  {
    name: "projects_add_comment",
    description: "Add a comment to a task",
    schema: z.object({
      task: z.string().uuid(),
      comment: z.string().min(1),
    }),
    async handler(args: { task: string; comment: string }, userId: string) {
      const existing = (await supabaseAdmin.from("tasks").select("id").eq("id", args.task).single()).data;
      if (!existing) notFound("Task");
      const tc = (await supabaseAdmin.from("tasksComments").insert({
        v: 0, task: args.task, comment: args.comment, user: userId
      }).select().single()).data;
      return itemResponse(tc);
    },
  },
  {
    name: "projects_list_comments",
    description: "List comments on a task",
    schema: z.object({
      task: z.string().uuid(),
      ...paginationSchema,
    }),
    async handler(args: { task: string; limit: number; offset: number }, _userId: string) {
      const { data, count: total } = await supabaseAdmin.from("tasksComments")
        .select("*, assigned_user:user(id, name)", { count: "exact" })
        .eq("task", args.task)
        .order("createdAt", { ascending: false })
        .range(args.offset, args.offset + args.limit - 1);
      return listResponse(data || [], total || 0, args.offset);
    },
  },

  // ── Document Link ─────────────────────────────────────
  {
    name: "projects_assign_document",
    description: "Link a document to a task",
    schema: z.object({
      task_id: z.string().uuid(),
      document_id: z.string().uuid(),
    }),
    async handler(args: { task_id: string; document_id: string }, _userId: string) {
      await supabaseAdmin.from("documentsToTasks").insert({
        task_id: args.task_id, document_id: args.document_id
      });
      return itemResponse({ task_id: args.task_id, document_id: args.document_id });
    },
  },

  // ── Watchers ──────────────────────────────────────────
  {
    name: "projects_watch_board",
    description: "Watch or unwatch a project board",
    schema: z.object({
      board_id: z.string().uuid(),
      watch: z.boolean().default(true),
    }),
    async handler(args: { board_id: string; watch: boolean }, userId: string) {
      if (args.watch) {
        await supabaseAdmin.from("boardWatchers").insert({
          board_id: args.board_id, user_id: userId
        }).catch(() => {}); // Already watching — ignore duplicate
      } else {
        await supabaseAdmin.from("boardWatchers").delete().match({
          board_id: args.board_id, user_id: userId
        }).catch(() => {}); // Not watching — ignore
      }
      return itemResponse({ board_id: args.board_id, watching: args.watch });
    },
  },
];
