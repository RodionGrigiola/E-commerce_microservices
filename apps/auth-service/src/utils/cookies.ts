import type { Response } from "express";

const REFRESH_COOKIE_NAME = "refreshToken";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

export function setRefreshTokenCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, getCookieOptions());
}

export function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, getCookieOptions());
}
