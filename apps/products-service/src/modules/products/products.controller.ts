import type { Request, Response } from "express";
import { ProductsService } from "./products.service";
import { AppError, logger } from "@ecom/shared";
import { getProductsFilterSchema } from "./dto/products-filter.dto";

export class ProductsController {
  constructor(private productsService: ProductsService) {}

  getById = async (req: Request, res: Response) => {
    const productId = req.params.id;

    if (!productId || typeof productId !== "string") {
      throw new AppError("Invalid or missing product ID", 400);
    }

    const product = await this.productsService.getById(productId);
    logger.info(`[Products] Product ${productId} fetched successfully`);
    return res.status(200).json(product);
  };

  getAll = async (req: Request, res: Response) => {
    const filters = getProductsFilterSchema.parse(req.query);
    const products = await this.productsService.getAll(filters);
    logger.info(
      `[Products] Catalog fetched successfully { count: products.length }`,
    );
    return res.status(200).json(products);
  };
}
