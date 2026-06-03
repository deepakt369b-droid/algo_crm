import { Users } from "@/lib/prisma-types";

import sendEmail from "./sendmail";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function newUserNotify(newUser: Users) {
  const admins = (await supabaseAdmin.from("users").select("*").eq("role", "admin")).data || [];

  admins.forEach(async (admin) => {
    await sendEmail({
      from: process.env.EMAIL_FROM,
      to: admin.email,
      subject: `New User Registration with PENDING state`,
      text: `New User Registered: ${newUser.name} \n\n Please login to ${process.env.NEXT_PUBLIC_APP_URL}/admin/users and activate them. \n\n Thank you \n\n ${process.env.NEXT_PUBLIC_APP_NAME}`,
    });

    console.log("Email sent to admin");
  });
}
