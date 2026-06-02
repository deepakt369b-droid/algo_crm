import { z } from "zod";
import { ActionState } from "@/lib/create-safe-action";
import { UpdatePurchaseOrderStatus } from "./schema";

type Result = { id: string; status: string };

export type InputType = z.infer<typeof UpdatePurchaseOrderStatus>;
export type ReturnType = ActionState<InputType, Result>;
