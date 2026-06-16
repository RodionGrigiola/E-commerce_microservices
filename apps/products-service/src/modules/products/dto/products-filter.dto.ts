import { z } from "zod";
import { ProductType } from "../../../generated/prisma/index";

export const getProductsFilterSchema = z.object({
  type: z.enum(ProductType).optional(),
});

export type GetProductsFilterDto = z.infer<typeof getProductsFilterSchema>;
