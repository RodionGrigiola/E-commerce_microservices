import express from "express";
import cookieParser from "cookie-parser";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { AuthController } from "./modules/auth/auth.controller.js";
import { AuthService } from "./modules/auth/auth.service.js";
import { AuthRepository } from "./modules/auth/auth.repository.js";
import { prisma } from "./db/prisma.js";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";
import { logger } from "./lib/logger.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

export const app = express();

app.use(loggerMiddleware);
app.use(express.json());
app.use(cookieParser());

const repo = new AuthRepository(prisma);
const service = new AuthService(repo);
const controller = new AuthController(service);

app.use("/auth", authRoutes(controller));

app.get("/health", (_, res) => {
  logger.debug("Health check endpoint evaluated");
  res.json({ status: "ok" });
});

app.use(errorHandler);
