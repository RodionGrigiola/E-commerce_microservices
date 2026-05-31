import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("No access token provided", 401);
  }

  const tokenParts = authHeader.split(" ");
  const token = tokenParts[1];

  if (tokenParts[0] !== "Bearer" || !token) {
    throw new AppError("Invalid token format, Bearer schema required", 401);
  }

  // Local try/catch is REQUIRED here to translate technical JWT errors into structured 401 responses
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
      userId: string;
    };

    req.user = {
      id: payload.userId,
    };

    next();
  } catch (err: any) {
    throw new AppError("Invalid or expired access token", 401);
  }
}
