import express from "express";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { AuthController } from "./modules/auth/auth.controller.js";
import { AuthService } from "./modules/auth/auth.service.js";
import { AuthRepository } from "./modules/auth/auth.repository.js";
import { prisma } from "./db/prisma.js";

export const app = express();

app.use(express.json());

const repo = new AuthRepository(prisma);
const service = new AuthService(repo);
const controller = new AuthController(service);

app.use("/auth", authRoutes(controller));

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});
