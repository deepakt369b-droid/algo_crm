"use server";
import {
  requireRole,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface AuditLogAdminFilters {
  entityType?: string;
  action?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
}

export const getAuditLogAdmin = async (filters: AuditLogAdminFilters = {}) => {
  try {
    await requireRole(["admin"]);
  } catch (e) {
    if (e instanceof AuthenticationError) return { error: "Unauthorized" };
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    throw e;
  }

  const { entityType, action, userId, dateFrom, dateTo, page = 1 } = filters;
  const take = 50;
  const skip = (page - 1) * take;

  let query = supabaseAdmin
    .from("crm_AuditLog")
    .select("*, user:Users(id, name, avatar)", { count: "exact" })
    .order("createdAt", { ascending: false })
    .range(skip, skip + take - 1);

  if (entityType) query = query.eq("entityType", entityType);
  if (action) query = query.eq("action", action);
  if (userId) query = query.eq("userId", userId);
  if (dateFrom) query = query.gte("createdAt", dateFrom.toISOString());
  if (dateTo) query = query.lte("createdAt", dateTo.toISOString());

  const { data: entries, count, error } = await query;

  if (error) {
    console.error("Audit log error:", error);
    return { error: "Failed to fetch audit logs" };
  }

  const total = count || 0;
  return { data: entries, total, page, totalPages: Math.ceil(total / take) };
};
