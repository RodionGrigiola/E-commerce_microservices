import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

export const authRoutes = (controller: AuthController) => {
  const router = Router();

  router.post("/register", controller.register);
  router.post("/login", controller.login);
  router.post("/logout", authMiddleware, controller.logout);
  router.post("/refresh", controller.refresh);

  router.get("/me", authMiddleware, (req, res) => {
    res.json({
      id: req.user?.id,
    });
  });

  return router;
};
