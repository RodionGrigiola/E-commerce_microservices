import { Router } from "express";
import { ProductsController } from "./products.controller";

export const productsRouter = (controller: ProductsController) => {
  const router = Router();

  router.get("/", controller.getAll);
  router.get("/:id", controller.getById);

  return router;
};
