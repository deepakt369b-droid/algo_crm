import { z } from "zod";
import { SetReorderThreshold } from "./schema";

export type InputType = z.infer<typeof SetReorderThreshold>;

export type ReturnType = {
  error?: string;
  data?: {
    productId: string;
    warehouseId: string;
    reorderPoint: number;
  };
};
