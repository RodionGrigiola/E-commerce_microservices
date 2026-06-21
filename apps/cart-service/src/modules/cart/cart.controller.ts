import type { Request, Response } from "express";
import { CartService } from "./cart.service";
import { addItemSchema, updateItemQuantitySchema } from "./dto/cart.dto";
import { AppError, logger, ValidationError } from "@ecom/shared";
import { ZodError } from "zod";

export class CartController {
  constructor(private cartService: CartService) {}

  getCart = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized. Please log in.", 401);
    }

    const cart = await this.cartService.getCart(userId);
    return res.status(200).json(cart);
  };

  addItem = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized. Please log in.", 401);
    }

    try {
      const validatedData = addItemSchema.parse(req.body);
      const result = await this.cartService.addItem(userId, validatedData);

      logger.info(
        `[Cart] Item ${validatedData.productId} added to user ${userId} cart`,
      );
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof ZodError) throw new ValidationError(error);

      throw error;
    }
  };

  updateQuantity = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const productId = req.params.productId;

    if (!userId) {
      throw new AppError("Unauthorized. Please log in.", 401);
    }
    if (!productId || typeof productId !== "string") {
      throw new AppError("Invalid or missing product ID", 400);
    }

    try {
      const { quantity } = updateItemQuantitySchema.parse(req.body);
      const result = await this.cartService.updateItemQuantity(
        userId,
        productId,
        quantity,
      );

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof ZodError) throw new ValidationError(error);

      throw error;
    }
  };

  removeItem = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const productId = req.params.productId;

    if (!userId) {
      throw new AppError("Unauthorized. Please log in.", 401);
    }
    if (!productId || typeof productId !== "string") {
      throw new AppError("Invalid or missing product ID", 400);
    }

    await this.cartService.removeItem(userId, productId);
    logger.info(`[Cart] Item ${productId} removed from user ${userId} cart`);

    return res
      .status(200)
      .json({ success: true, message: "Item removed from cart" });
  };
}
