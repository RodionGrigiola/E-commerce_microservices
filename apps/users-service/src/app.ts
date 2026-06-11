import express from "express";
import cookieParser from "cookie-parser";
import { usersRoutes } from "./modules/users/users.routes";
import { UsersController } from "./modules/users/users.controller";
import { UsersService } from "./modules/users/users.service";
import { UsersRepository } from "./modules/users/users.repository";
import { prisma } from "./db/prisma";
import { errorHandler, logger, loggerMiddleware } from "@ecom/shared";

export const app = express();

app.use(loggerMiddleware);
app.use(express.json());
app.use(cookieParser());

const repo = new UsersRepository(prisma);
const service = new UsersService(repo);
const controller = new UsersController(service);

app.use("/users", usersRoutes(controller));

app.get("/health", (_, res) => {
  logger.debug("Health check endpoint evaluated");
  res.json({ status: "ok" });
});

app.use(errorHandler);
