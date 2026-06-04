import type { Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { AppError } from "../utils/AppError";
import { logger } from "../lib/logger";
import { env } from "../config/env";

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
    environment: env.NODE_ENV,
  });
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

  if (!isOperational) {
    // Critical 500 exceptions (e.g. database crash) get logged with complete stack traces
    logger.error("CRITICAL UNHANDLED EXCEPTION ENCOUNTERED", {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    if (env.SENTRY_DSN) {
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
    // Extract and log full Zod context metadata if available on the error object
    const errorDetails = (err as any).errors || undefined;

    logger.warn(`Operational application warning: ${errorMessage}`, {
      path: req.path,
      method: req.method,
      statusCode,
      details: errorDetails, // Helps to see exact field validation failures in logs/app.log
    });
  }

  res.status(statusCode).json({
    status: "error",
    message:
      isOperational || env.NODE_ENV === "development"
        ? errorMessage
        : "Something went wrong internally",
    // Attach validation fields context to the client response json body if present
    ...((err as any).errors && { errors: (err as any).errors }),
    ...(env.NODE_ENV === "development" &&
      !isOperational && { stack: err.stack }),
  });
}
