import { z } from "zod";
import { AdjustStock } from "./schema";

export type InputType = z.infer<typeof AdjustStock>;

export type ReturnType = {
  error?: string;
  data?: {
    productId: string;
    warehouseId: string;
    quantity: number;
  };
};
