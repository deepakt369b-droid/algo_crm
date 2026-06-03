
import {
  requireAuthenticated,
  AuthenticationError,
} from "@/lib/authz";
import dayjs from "dayjs";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getTasksPastDue = async () => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return undefined;
    throw e;
  }
  const today = dayjs().startOf("day");
  const nextWeek = dayjs().add(7, "day").startOf("day");
  // user role: restrict to own tasks. manager/admin: global.
  const userScope =
    user.role === "user" ? [{ user: user.id }] : [];

  const getTaskPastDue = (await supabaseAdmin.from("tasks").select("*, comments(id, comment, createdAt, assigned_user(id, name, avatar))").eq("AND", [
          ...userScope,
          {
            dueDateAt: {
              lte: new Date(),
            },
          },
          {
            taskStatus: {
              not: "COMPLETE",
            },
          },
        ])).data;

  const getTaskPastDueInSevenDays = (await supabaseAdmin.from("tasks").select("*, comments(id, comment, createdAt, assigned_user(id, name, avatar))").eq("AND", [
          ...userScope,
          {
            dueDateAt: {
              gt: today.toDate(),
              lt: nextWeek.toDate(),
            },
          },
          {
            taskStatus: {
              not: "COMPLETE",
            },
          },
        ])).data;

  const data = {
    getTaskPastDue,
    getTaskPastDueInSevenDays,
  };

  return data;
};
