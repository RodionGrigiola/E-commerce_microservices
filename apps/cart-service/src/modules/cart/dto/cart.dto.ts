import { z } from "zod";

export const addItemSchema = z
  .object({
    productId: z.uuid("Invalid product ID format"),
    quantity: z
      .number()
      .int("Quantity must be an integer")
      .positive("Quantity must be greater than 0"),
  })
  .strict();

export const updateItemQuantitySchema = addItemSchema.pick({ quantity: true });

export type AddItemDto = z.infer<typeof addItemSchema>;
export type UpdateItemQuantityDto = z.infer<typeof updateItemQuantitySchema>;
