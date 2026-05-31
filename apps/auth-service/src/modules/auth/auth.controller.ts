import z from "zod";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { registerSchema } from "./dto/register.dto.js";
import { loginSchema } from "./dto/login.dto.js";
import { setRefreshTokenCookie } from "../../utils/cookies.js";
import { AppError } from "../../utils/AppError.js";
import { logger } from "../../lib/logger.js"; // Correct import of your custom Winston logger

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      // Express 5 catches this thrown AppError and routes it instantly to your global errorHandler
      throw new AppError("Validation Error", 400);
    }

    const { email, password } = parsed.data;

    // No try/catch wrapping required. Async rejections bubble up into errorHandler automatically
    const result = await this.authService.register(email, password);

    setRefreshTokenCookie(res, result.refreshToken);

    // Operational success logs remain safely inside the core controller context
    logger.info("User registered successfully", {
      userId: result.user.id,
      email,
    });

    return res.status(201).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  };

  login = async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError("Validation error", 400);
    }

    const { email, password } = parsed.data;

    const result = await this.authService.login(email, password);

    setRefreshTokenCookie(res, result.refreshToken);

    logger.info("User logged in successfully", {
      userId: result.user.id,
      email,
    });

    return res.status(200).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  };

  logout = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError("No refresh token provided", 401);
    }

    await this.authService.logout(refreshToken);

    res.clearCookie("refreshToken");

    logger.info("User logged out successfully");

    return res.status(200).json({ success: true });
  };

  refresh = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError("No refresh token provided", 401);
    }

    const result = await this.authService.refresh(refreshToken);

    setRefreshTokenCookie(res, result.refreshToken);

    logger.info("Token refreshed successfully", {
      accessTokenLength: result.accessToken.length,
    });

    return res.status(200).json({
      accessToken: result.accessToken,
    });
  };
}
