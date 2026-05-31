import z from "zod";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { registerSchema } from "./dto/register.dto.js";
import { loginSchema } from "./dto/login.dto.js";
import { setRefreshTokenCookie } from "../../utils/cookies.js";

export class AuthController {
  constructor(private authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: z.treeifyError(parsed.error),
      });
    }

    const { email, password } = parsed.data;

    const result = await this.authService.register(email, password);

    setRefreshTokenCookie(res, result.refreshToken);

    return res.status(201).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  };

  login = async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: z.treeifyError(parsed.error),
      });
    }

    const { email, password } = parsed.data;

    const result = await this.authService.login(email, password);

    setRefreshTokenCookie(res, result.refreshToken);

    return res.status(200).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  };

  logout = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    console.log("cookies token:", refreshToken);

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    await this.authService.logout(refreshToken);

    res.clearCookie("refreshToken");

    return res.status(200).json({ success: true });
  };

  refresh = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const result = await this.authService.refresh(refreshToken);

    setRefreshTokenCookie(res, result.refreshToken);

    return res.status(200).json({
      accessToken: result.accessToken,
    });
  };
}
