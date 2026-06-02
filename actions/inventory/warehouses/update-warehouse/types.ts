import { z } from "zod";
import { UpdateWarehouse } from "./schema";

export type InputType = z.infer<typeof UpdateWarehouse>;

export type ReturnType = {
  error?: string;
  data?: {
    id: string;
    name: string;
    code: string;
  };
};
