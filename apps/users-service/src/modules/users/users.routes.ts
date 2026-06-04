import { Router } from "express";
import { UsersController } from "./users.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

export const usersRoutes = (controller: UsersController) => {
  const router = Router();

  router.get("/me", authMiddleware, controller.getMe);
  router.put("/profile", authMiddleware, controller.update);
  router.delete("/profile", authMiddleware, controller.delete);

  return router;
};
