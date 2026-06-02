import { z } from "zod";
import { ActionState } from "@/lib/create-safe-action";
import { AddPurchaseOrderLineItem } from "./schema";

type Result = { id: string };

export type InputType = z.infer<typeof AddPurchaseOrderLineItem>;
export type ReturnType = ActionState<InputType, Result>;
