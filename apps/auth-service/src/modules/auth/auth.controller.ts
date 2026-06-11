import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { registerSchema } from "./dto/register.dto";
import { loginSchema } from "./dto/login.dto";
import { setRefreshTokenCookie } from "../../utils/cookies";
import { AppError } from "@ecom/shared";
import { logger } from "@ecom/shared";

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError("Validation Error", 400);
    }

    const { email, password } = parsed.data;

    const result = await this.authService.register(email, password);

    setRefreshTokenCookie(res, result.refreshToken);

    logger.info("User registered successfully", {
      userId: result.user.id,
      email,
    });

    return res.status(201).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  }

  async login(req: Request, res: Response) {
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
  }

  async logout(req: Request, res: Response) {
    console.log("LOGOUT HIT");
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError("No refresh token provided", 401);
    }

    await this.authService.logout(refreshToken);

    res.clearCookie("refreshToken");

    logger.info("User logged out successfully");

    return res.status(200).json({ success: true });
  }

  async refresh(req: Request, res: Response) {
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
  }
}
