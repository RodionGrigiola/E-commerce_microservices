import { z } from "zod";

const ProductTypeSchema = z.enum(["COFFEE", "TEA"]);

export const createProductSchema = z
  .object({
    sku: z.string().min(3, "SKU must be at least 3 characters").toUpperCase(),

    name: z
      .string()
      .min(2, "Product name must be at least 2 characters")
      .max(100, "Product name is too long"),

    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),

    price: z.number().positive("Price must be greater than 0"),

    type: ProductTypeSchema,

    image: z.url("Invalid image URL format").optional(),

    stock: z
      .number()
      .int("Stock must be an integer")
      .nonnegative("Stock cannot be negative")
      .default(0),

    attributes: z.record(z.string(), z.any()).optional().default({}),
  })
  .strict();

export const updateProductSchema = createProductSchema.partial().strict();

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
