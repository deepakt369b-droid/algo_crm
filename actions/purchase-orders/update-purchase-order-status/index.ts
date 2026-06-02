"use server";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";
import { UpdatePurchaseOrderStatus } from "./schema";
import { InputType, ReturnType } from "./types";
import { createSafeAction } from "@/lib/create-safe-action";
import { writeAuditLog } from "@/lib/audit-log";
import { revalidatePath } from "next/cache";

// Valid status transitions
const validTransitions: Record<string, string[]> = {
  DRAFT: ["PENDING_APPROVAL", "CANCELLED"],
  PENDING_APPROVAL: ["APPROVED", "REJECTED", "DRAFT"],
  APPROVED: ["ORDERED", "CANCELLED"],
  REJECTED: ["DRAFT"],
  ORDERED: ["PARTIALLY_RECEIVED", "RECEIVED", "CANCELLED"],
  PARTIALLY_RECEIVED: ["RECEIVED", "CANCELLED"],
  RECEIVED: [],
  CANCELLED: [],
};

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;
  const { id, status, rejectionReason } = data;

  try {
    const existing = await prismadb.purchaseOrders.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      return { error: "Purchase order not found" };
    }

    // Validate transition
    const allowed = validTransitions[existing.status] || [];
    if (!allowed.includes(status)) {
      return {
        error: `Cannot transition from "${existing.status}" to "${status}". Allowed transitions: ${allowed.join(", ") || "none"}`,
      };
    }

    const updateData: Record<string, unknown> = {
      status,
      updatedBy: userId,
    };

    // Handle special transitions
    if (status === "APPROVED") {
      updateData.approvedBy = userId;
      updateData.approvedAt = new Date();
    }
    if (status === "REJECTED") {
      updateData.rejectionReason = rejectionReason || undefined;
    }
    if (status === "RECEIVED") {
      updateData.deliveredDate = new Date();
    }

    const updated = await prismadb.purchaseOrders.update({
      where: { id },
      data: updateData,
    });

    await writeAuditLog({
      entityType: "purchase_order",
      entityId: updated.id,
      action: "updated",
      changes: { status: { from: existing.status, to: status } },
      userId,
    });

    revalidatePath("/[locale]/(routes)/admin/purchase", "page");
    revalidatePath(`/[locale]/(routes)/admin/purchase/${id}`, "page");
    return { data: { id: updated.id, status: updated.status } };
  } catch (error) {
    console.log("[UPDATE_PURCHASE_ORDER_STATUS]", error);
    return { error: "Failed to update purchase order status" };
  }
};

export const updatePurchaseOrderStatus = createSafeAction(UpdatePurchaseOrderStatus, handler);
