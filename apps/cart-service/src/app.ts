import express from "express";
import { prisma } from "./db/prisma";
import {
  authMiddleware,
  errorHandler,
  logger,
  loggerMiddleware,
} from "@ecom/shared";
import { CartRepository } from "./modules/cart/cart.repository";
import { CartService } from "./modules/cart/cart.service";
import { CartController } from "./modules/cart/cart.controller";
import { cartRouter } from "./modules/cart/cart.routes";

export const app = express();

app.use(loggerMiddleware);
app.use(express.json());

const repo = new CartRepository(prisma);
const service = new CartService(repo);
const controller = new CartController(service);

app.use("/cart", cartRouter(controller, authMiddleware));

app.get("/health", (_, res) => {
  logger.debug("Health check endpoint evaluated");
  res.json({ status: "ok" });
});

app.use(errorHandler);
