"use server";

import InviteUserEmail from "@/emails/InviteUser";
import resendHelper from "@/lib/resend";
import { revalidatePath } from "next/cache";
import { Language } from "@/lib/prisma-types";
import {
  requireRole,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const inviteUser = async (data: {
  name: string;
  email: string;
  language: string;
}) => {
  let actor;
  try {
    actor = await requireRole(["admin"]);
  } catch (e) {
    if (e instanceof AuthenticationError) return { error: "Unauthorized" };
    if (e instanceof AuthorizationError) return { error: "Forbidden" };
    throw e;
  }

  const inviter = (await supabaseAdmin.from("Users").select("name").eq("id", actor.id).single()).data;

  const { name, email, language } = data;

  if (!name || !email || !language) {
    return { error: "Name, Email, and Language is required!" };
  }

  let resend;
  try {
    resend = await resendHelper();
  } catch (error: any) {
    return { error: error?.message || "Resend API key is not configured" };
  }

  const checkexisting = (await supabaseAdmin.from("Users").select("*").eq("email", email).single()).data;

  if (checkexisting) {
    return { error: "User already exists!" };
  }

  try {
    const user = (await supabaseAdmin.from("Users").insert({
                name,
                email,
                userStatus: "ACTIVE",
                userLanguage: language as Language,
                role: "user",
              }).select("*").single()).data;

    if (!user) {
      return { error: "User not created" };
    }

    await resend.emails.send({
      from: `${process.env.NEXT_PUBLIC_APP_NAME} <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: `You have been invited to ${process.env.NEXT_PUBLIC_APP_NAME}`,
      react: InviteUserEmail({
        invitedByUsername: inviter?.name || "admin",
        username: user.name!,
        userLanguage: language,
      }),
    });

    revalidatePath("/[locale]/(routes)/admin", "page");
    return { data: user };
  } catch (error) {
    console.log("[INVITE_USER]", error);
    return { error: "Failed to invite user" };
  }
};
