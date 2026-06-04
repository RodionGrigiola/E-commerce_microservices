import { z } from "zod";

export const updateProfileSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .optional(),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
      .optional(),
    address: z
      .string()
      .min(5, "Address must be at least 5 characters")
      .optional(),
  })
  .strict(); // strict() forbids other fields

export type LoginDto = z.infer<typeof updateProfileSchema>;
