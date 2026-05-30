import { Router } from "express";
import { AuthController } from "./auth.controller.js";

export const authRoutes = (controller: AuthController) => {
  const router = Router();

  router.post("/register", controller.register);

  return router;
};
