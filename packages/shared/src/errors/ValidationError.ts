import { ZodError } from "zod";
import { AppError } from "./AppError";

export class ValidationError extends AppError {
  public readonly errors: Array<{ field: string; message: string }>;

  constructor(zodError: ZodError) {
    super("Validation failed", 400);

    this.errors = zodError.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  }
}
