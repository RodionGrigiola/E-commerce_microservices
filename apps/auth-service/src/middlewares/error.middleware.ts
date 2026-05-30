import type { Request, Response, NextFunction } from "express";

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log(err);

  res.status(500).json({
    message: "Internal Server Error",
  });
}
