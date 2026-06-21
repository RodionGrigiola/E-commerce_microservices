import { Router } from "express";
import { CartController } from "./cart.controller";

export const cartRouter = (controller: CartController, authMiddleware: any) => {
  const router = Router();

  router.use(authMiddleware);

  router.get("/", controller.getCart);
  router.post("/", controller.addItem);

  router.put("/:productId", controller.updateQuantity);
  router.delete("/:productId", controller.removeItem);

  return router;
};
