import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

export function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    if (res.statusCode === 404) {
      logger.warn("HTTP Request", {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
      });
    } else {
      logger.info("HTTP Request", {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
      });
    }
  });

  next();
}
