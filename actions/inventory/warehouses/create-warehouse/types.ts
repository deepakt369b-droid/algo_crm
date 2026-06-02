import { z } from "zod";
import { CreateWarehouse } from "./schema";

export type InputType = z.infer<typeof CreateWarehouse>;

export type ReturnType = {
  error?: string;
  data?: {
    id: string;
    name: string;
    code: string;
  };
};
