import { NextResponse } from "next/server";

// Handle POST requests from external web forms
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { tenantId, firstName, lastName, email, phone, company } = data;

    if (!tenantId) {
      return new NextResponse("Tenant ID is required", { status: 400 });
    }
    if (!email && !phone) {
      return new NextResponse("At least email or phone must be provided", { status: 400 });
    }

    // TODO: Create Lead in Supabase

    return NextResponse.json({ success: true, message: "Lead captured successfully" });
  } catch (error: any) {
    console.error("[Web-to-Lead Error]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
