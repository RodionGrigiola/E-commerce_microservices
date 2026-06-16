// import { rabbitClient } from "../../rabbit";
import type { GetProductsFilterDto } from "./dto/products-filter.dto";
import { ProductsRepository } from "./products.repository";
import { AppError, EcomEvent } from "@ecom/shared";

export class ProductsService {
  constructor(private productsRepo: ProductsRepository) {}

  async getById(id: string) {
    const product = await this.productsRepo.getProductById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return product;
  }

  async getAll(filters?: GetProductsFilterDto) {
    const products = await this.productsRepo.getAllProducts(filters);
    return products;
  }
}
