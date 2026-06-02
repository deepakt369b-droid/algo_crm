import { z } from "zod";
import { ActionState } from "@/lib/create-safe-action";
import { CreatePurchaseOrder } from "./schema";

type PurchaseOrderResult = { id: string; orderNumber: string };

export type InputType = z.infer<typeof CreatePurchaseOrder>;
export type ReturnType = ActionState<InputType, PurchaseOrderResult>;
