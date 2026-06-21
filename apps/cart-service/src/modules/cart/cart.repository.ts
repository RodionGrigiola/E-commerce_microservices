import type { PrismaClient } from "../../generated/prisma";
import type { AddItemDto } from "./dto/cart.dto";

export class CartRepository {
  constructor(private prisma: PrismaClient) {}

  async getOrCreateCart(userId: string) {
    return this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: {
        // join cart with cartItem
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  async addItem(cartId: string, data: AddItemDto) {
    return this.prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId,
          productId: data.productId,
        },
      },
      update: {
        quantity: { increment: data.quantity },
      },
      create: {
        cartId,
        productId: data.productId,
        quantity: data.quantity,
      },
    });
  }

  async updateItemQuantity(
    cartId: string,
    productId: string,
    quantity: number,
  ) {
    return this.prisma.cartItem.update({
      where: {
        cartId_productId: { cartId, productId },
      },
      data: { quantity },
    });
  }

  async removeItem(cartId: string, productId: string) {
    return this.prisma.cartItem.delete({
      where: {
        cartId_productId: { cartId, productId },
      },
    });
  }

  async clearCart(cartId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }
}
