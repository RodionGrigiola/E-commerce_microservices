import { CartRepository } from "./cart.repository";
import { AppError } from "@ecom/shared";
import type { AddItemDto } from "./dto/cart.dto";

export class CartService {
  constructor(private cartRepo: CartRepository) {}

  async getCart(userId: string) {
    return this.cartRepo.getOrCreateCart(userId);
  }

  async addItem(userId: string, data: AddItemDto) {
    const cart = await this.cartRepo.getOrCreateCart(userId);

    return this.cartRepo.addItem(cart.id, data);
  }

  async updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
  ) {
    const cart = await this.cartRepo.getOrCreateCart(userId);

    const existingItem = cart.items.find(
      (item) => item.productId === productId,
    );
    if (!existingItem) {
      throw new AppError("Product not found in your cart", 404);
    }

    return this.cartRepo.updateItemQuantity(cart.id, productId, quantity);
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.cartRepo.getOrCreateCart(userId);

    const existingItem = cart.items.find(
      (item) => item.productId === productId,
    );
    if (!existingItem) {
      throw new AppError("Product not found in your cart", 404);
    }

    return this.cartRepo.removeItem(cart.id, productId);
  }

  async clearCart(userId: string) {
    const cart = await this.cartRepo.getOrCreateCart(userId);
    return this.cartRepo.clearCart(cart.id);
  }
}
