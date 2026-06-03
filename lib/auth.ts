import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { emailOTP, testUtils } from "better-auth/plugins";
import { admin as adminPlugin } from "better-auth/plugins";

import { ac, admin, manager, user, superadmin } from "@/lib/auth-permissions";
import { newUserNotify } from "@/lib/new-user-notify";
import resendHelper from "@/lib/resend";
import { supabaseAdmin } from "@/lib/supabase-admin";

const isDemo = process.env.NEXT_PUBLIC_APP_URL === "https://demo.flowlinepro.io";

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://dummy:dummy@localhost:5432/dummy" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  advanced: {
    database: {
      generateId: "uuid",
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,       // 7 days
    updateAge: 60 * 60 * 24,            // refresh every 24 hours
  },

  user: {
    modelName: "Users",
    fields: {
      createdAt: "created_on",
      updatedAt: "updated_at",
    },
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
      },
      userStatus: {
        type: "string",
        defaultValue: isDemo ? "ACTIVE" : "PENDING",
        input: false,
      },
      userLanguage: {
        type: "string",
        defaultValue: "en",
        input: false,
      },
      avatar: {
        type: "string",
        required: false,
        input: false,
      },
      isSuperAdmin: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
      tenantId: {
        type: "string",
        required: false,
        input: false,
      },
      accessibleTabs: {
        type: "string[]",
        required: false,
        input: false,
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    },
  },

  emailAndPassword: {
    enabled: true,
  },

  plugins: [
    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        if (process.env.NODE_ENV !== "production") {
          console.log(`\n==========================================`);
          console.log(`[DEV/TEST OTP] Email: ${email}`);
          console.log(`[DEV/TEST OTP] OTP Code: ${otp}`);
          console.log(`==========================================\n`);
        }
        try {
          const resend = await resendHelper();
          await resend.emails.send({
            from: `${process.env.NEXT_PUBLIC_APP_NAME} <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: `Your verification code: ${otp}`,
            text: `Your one-time verification code is: ${otp}\n\nThis code expires in 5 minutes.\n\nIf you did not request this, please ignore this email.`,
          });
        } catch (e) {
          // In dev/test, email sending may fail — OTP is captured by testUtils plugin
          if (process.env.NODE_ENV !== "production") {
            console.log(`[Auth] OTP email send failed for ${email}, but captured by testUtils (OTP was ${otp})`);
          } else {
            throw e;
          }
        }
      },
    }),
    // testUtils captures OTPs for E2E testing — only enabled in non-production
    ...(process.env.NODE_ENV !== "production"
      ? [testUtils({ captureOTP: true })]
      : []),
    adminPlugin({
      ac,
      roles: { superadmin, admin, manager, user },
      defaultRole: "user",
    }),
  ],

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  callbacks: {
    async onUserCreated(user: { id: string }) {
      // Check if this is the first user — make them admin
      const count = (await supabaseAdmin.from("users").select("*", { count: 'exact', head: true })).count;
      if (count === 1) {
        (await supabaseAdmin.from("users").update({ role: "superadmin", isSuperAdmin: true, userStatus: "ACTIVE" }).eq("id", user.id).select("*").single()).data;
      } else if (!isDemo) {
        // Notify admins about new pending user
        const dbUser = (await supabaseAdmin.from("users").select("*").eq("id", user.id).single()).data;
        if (dbUser) {
          await newUserNotify(dbUser);
        }
      }
    },
  },
});

export type Session = typeof auth.$Infer.Session;
