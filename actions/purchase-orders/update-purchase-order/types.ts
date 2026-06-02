import { z } from "zod";
import { ActionState } from "@/lib/create-safe-action";
import { UpdatePurchaseOrder } from "./schema";

type PurchaseOrderResult = { id: string; orderNumber: string };

export type InputType = z.infer<typeof UpdatePurchaseOrder>;
export type ReturnType = ActionState<InputType, PurchaseOrderResult>;
