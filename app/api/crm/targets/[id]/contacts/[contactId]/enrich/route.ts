import {
  requireAuthenticated,
  assertCanWriteTarget,
  unauthorizedResponse,
  notFoundOrForbiddenResponse,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/authz";

import { inngest } from "@/inngest/client";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; contactId: string }> },
) {
  const { id: targetId, contactId } = await params;

  let user;
  try {
    user = await requireAuthenticated();
  } catch (e) {
    if (e instanceof AuthenticationError) return unauthorizedResponse();
    throw e;
  }

  try {
    await assertCanWriteTarget(user, targetId);
  } catch (e) {
    if (e instanceof AuthorizationError) return notFoundOrForbiddenResponse();
    throw e;
  }

  const link = (await supabaseAdmin.from("crm_Target_Contact").select("id").eq("id", contactId).eq("targetId", targetId).single()).data;
  if (!link) return notFoundOrForbiddenResponse();

  await inngest.send({
    name: "enrich/target.contact.run",
    data: { contactId, triggeredBy: user.id },
  });

  return NextResponse.json({ queued: true });
}
