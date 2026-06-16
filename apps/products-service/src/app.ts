import express from "express";
import { prisma } from "./db/prisma";
import { errorHandler, logger, loggerMiddleware } from "@ecom/shared";
import { ProductsRepository } from "./modules/products/products.repository";
import { ProductsService } from "./modules/products/products.service";
import { ProductsController } from "./modules/products/products.controller";
import { productsRouter } from "./modules/products/products.routes";

export const app = express();

app.use(loggerMiddleware);
app.use(express.json());

const repo = new ProductsRepository(prisma);
const service = new ProductsService(repo);
const controller = new ProductsController(service);

app.use("/products", productsRouter(controller));

app.get("/health", (_, res) => {
  logger.debug("Health check endpoint evaluated");
  res.json({ status: "ok" });
});

app.use(errorHandler);
