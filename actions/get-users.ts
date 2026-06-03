import { supabaseAdmin } from "@/lib/supabase-admin";

//Get all users  for admin module
export const getUsers = async () => {
  const data = (await supabaseAdmin.from("users").select("*").order("created_on", { ascending: false })).data;
  return data;
};

//Get active users for Selects in app etc
export const getActiveUsers = async () => {
  const data = (await supabaseAdmin.from("users").select("id, name, avatar").eq("userStatus", "ACTIVE").order("name", { ascending: true })).data;
  return data;
};

//Get new users by month for chart
export const getUsersByMonthAndYear = async (year: number) => {
  const users = (await supabaseAdmin.from("users").select("created_on")).data;

  if (!users) {
    return {};
  }

  const usersByMonth = users.reduce((acc: any, user: any) => {
    const yearCreated = new Date(user.created_on).getFullYear();
    const month = new Date(user.created_on).toLocaleString("default", {
      month: "long",
    });

    if (yearCreated === year) {
      acc[month] = (acc[month] || 0) + 1;
    }

    return acc;
  }, {});

  const chartData = Object.keys(usersByMonth).map((month: any) => {
    return {
      name: month,
      Number: usersByMonth[month],
    };
  });

  return chartData;
};

//Get new users by month for chart
export const getUsersByMonth = async () => {
  const users = (await supabaseAdmin.from("users").select("created_on")).data;

  if (!users) {
    return {};
  }

  const usersByMonth = users.reduce((acc: any, user: any) => {
    const month = new Date(user.created_on).toLocaleString("default", {
      month: "long",
    });

    acc[month] = (acc[month] || 0) + 1;

    return acc;
  }, {});

  const chartData = Object.keys(usersByMonth).map((month: any) => {
    return {
      name: month,
      Number: usersByMonth[month],
    };
  });

  return chartData;
};

export const getUsersCountOverall = async () => {
  const users = (await supabaseAdmin.from("users").select("created_on")).data;

  if (!users) {
    return {};
  }

  const usersByMonth = users.reduce((acc: any, user: any) => {
    const date = new Date(user.created_on);
    const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;

    acc[yearMonth] = (acc[yearMonth] || 0) + 1;

    return acc;
  }, {});

  const chartData = Object.keys(usersByMonth).map((yearMonth: any) => {
    const [year, month] = yearMonth.split("-");
    return {
      year: parseInt(year),
      month: parseInt(month),
      name: `${month}/${year}`,
      Number: usersByMonth[yearMonth],
    };
  });

  return chartData;
};
