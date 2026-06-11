import express from "express";
import cookieParser from "cookie-parser";
import { authRoutes } from "./modules/auth/auth.routes";
import { AuthController } from "./modules/auth/auth.controller";
import { AuthService } from "./modules/auth/auth.service";
import { AuthRepository } from "./modules/auth/auth.repository";
import { prisma } from "./db/prisma";
import { TokenService } from "./modules/auth/tokenService";
import { errorHandler, logger, loggerMiddleware } from "@ecom/shared";

export const app = express();

app.use(loggerMiddleware);
app.use(express.json());
app.use(cookieParser());

const repo = new AuthRepository(prisma);
const tokenService = new TokenService();
const service = new AuthService(repo, tokenService);
const controller = new AuthController(service);

app.use("/auth", authRoutes(controller));

app.get("/health", (_, res) => {
  logger.debug("Health check endpoint evaluated");
  res.json({ status: "ok" });
});

app.use(errorHandler);
