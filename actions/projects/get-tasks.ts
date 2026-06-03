
import {
  requireAuthenticated,
  boardReadScopeWhere,
  AuthenticationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const getTasks = async () => {
  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return [];
    throw e;
  }

  const data = (await supabaseAdmin.from("tasks").select("*").order("createdAt", { ascending: false })).data;
  return data;
};

//get tasks by month for chart
export const getTasksByMonth = async () => {
  const tasks = (await supabaseAdmin.from("tasks").select("createdAt")).data;

  if (!tasks) {
    return {};
  }

  const tasksByMonth = tasks.reduce((acc: any, task: any) => {
    const month = new Date(task.createdAt).toLocaleString("default", {
      month: "long",
    });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(tasksByMonth).map((month: any) => {
    return {
      name: month,
      Number: tasksByMonth[month],
    };
  });

  return chartData;
};
