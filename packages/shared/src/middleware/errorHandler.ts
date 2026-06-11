import type { Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { AppError } from "../errors";
import { logger } from "../lib/logger";

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (dsn && dsn !== "placeholder") {
    Sentry.init({
      dsn,
      integrations: [nodeProfilingIntegration()],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
      environment: process.env.NODE_ENV || "development",
    });
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const isOperational = err instanceof AppError ? err.isOperational : false;
  const errorMessage = err.message || "Internal Server Error";
  const nodeEnv = process.env.NODE_ENV || "development";
  const hasSentry =
    process.env.SENTRY_DSN && process.env.SENTRY_DSN !== "placeholder";

  if (!isOperational) {
    logger.error("CRITICAL UNHANDLED EXCEPTION ENCOUNTERED", {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    if (hasSentry) {
      Sentry.withScope((scope) => {
        scope.setTag("path", req.path);
        scope.setTag("method", req.method);

        if (req.user?.id) {
          scope.setUser({ id: req.user.id });
        }

        Sentry.captureException(err);
      });
    }
  } else {
    const errorDetails = (err as any).errors || undefined;

    logger.warn(`Operational application warning: ${errorMessage}`, {
      path: req.path,
      method: req.method,
      statusCode,
      details: errorDetails,
    });
  }

  res.status(statusCode).json({
    status: "error",
    message:
      isOperational || nodeEnv === "development"
        ? errorMessage
        : "Something went wrong internally",
    ...((err as any).errors && { errors: (err as any).errors }),
    ...(nodeEnv === "development" && !isOperational && { stack: err.stack }),
  });
}
