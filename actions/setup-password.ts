"use server";

import { auth } from "@/lib/auth";
import { prismadb } from "@/lib/prisma";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";

export async function setupPassword(password: string) {
  try {
    const session = await auth.api.getSession({
      headers: headers(),
    });

    if (!session || !session.user) {
      return { error: "Unauthorized" };
    }

    if (!password || password.length < 8) {
      return { error: "Password must be at least 8 characters long" };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user password in better-auth adapter
    // Wait, better-auth stores password in an `accounts` table usually, if using emailAndPassword.
    // Let's check prisma schema for accounts.
    // Let's just update `Users.password` if it exists, and `accounts` table if `emailAndPassword` creates an account record.
    
    // Better-auth uses `accounts` table with `providerId="credential"` and `password` field.
    const user = await prismadb.users.findUnique({
      where: { id: session.user.id },
    });
    
    if (!user) return { error: "User not found" };

    const account = await prismadb.account.findFirst({
      where: {
        userId: user.id,
        providerId: "credential",
      }
    });

    if (account) {
      await prismadb.account.update({
        where: { id: account.id },
        data: { password: hashedPassword },
      });
    } else {
      await prismadb.account.create({
        data: {
          userId: user.id,
          accountId: user.email,
          providerId: "credential",
          password: hashedPassword,
        }
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("[SETUP_PASSWORD_ERROR]", error);
    return { error: "Internal Server Error" };
  }
}
