import { z } from "zod";
import { TransferStock } from "./schema";

export type InputType = z.infer<typeof TransferStock>;

export type ReturnType = {
  error?: string;
  data?: {
    productId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
  };
};
