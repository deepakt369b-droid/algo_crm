import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthCallbackUrl } from "@/lib/app-url";
import { sendAuthOtpEmail } from "@/lib/auth-otp-email";
import { supabaseAdmin } from "@/lib/supabase-admin";

const requestSchema = z.object({
  email: z.string().trim().email(),
  mode: z.enum(["sign-in", "sign-up"]),
  nextPath: z.string().startsWith("/").optional(),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
  }

  const { email, mode, nextPath } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  if (mode === "sign-in") {
    const { data: existingUser, error: lookupError } = await supabaseAdmin
      .from("Users")
      .select("id")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json({ error: "Could not check this account. Try again." }, { status: 500 });
    }

    if (!existingUser) {
      return NextResponse.json({ error: "No SaaS account exists for this email." }, { status: 404 });
    }
  }

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: normalizedEmail,
    options: {
      redirectTo: getAuthCallbackUrl(nextPath || "/en/dashboard"),
    },
  });

  if (error || !data?.properties?.email_otp) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate verification code." },
      { status: 500 }
    );
  }

  try {
    await sendAuthOtpEmail(normalizedEmail, data.properties.email_otp);
  } catch (emailError: any) {
    return NextResponse.json(
      { error: emailError?.message || "Verification code was generated, but email sending failed." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    type: data.properties.verification_type || "magiclink",
  });
}
