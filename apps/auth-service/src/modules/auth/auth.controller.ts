import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { registerSchema } from "./dto/register.dto.js";
import z from "zod";

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    // 1. validate input

    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }

    const { email, password } = parsed.data;

    // 2. call service

    const result = await this.authService.register(email, password);

    res.status(201).json(result);
  };
}
