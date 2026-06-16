import type { PrismaClient, ProductType } from "../../generated/prisma/index";
import type {
  CreateProductDto,
  UpdateProductDto,
} from "./dto/create-update-product.dto";

export class ProductsRepository {
  constructor(private prisma: PrismaClient) {}

  createProduct(data: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        price: data.price,
        type: data.type,
        stock: data.stock,
        // If Zod returned undefined, we turn in into null for Prisma
        description: data.description ?? null,
        image: data.image ?? null,
        attributes: data.attributes || {},
      },
    });
  }

  updateProduct(id: string, data: UpdateProductDto) {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined),
    );

    return this.prisma.product.update({
      where: { id },
      data: {
        ...cleanData,
        ...(data.description !== undefined && {
          description: data.description ?? null,
        }),
        ...(data.image !== undefined && { image: data.image ?? null }),
      },
    });
  }

  deleteProduct(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  getProductById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  getAllProducts(filters?: { type?: ProductType }) {
    return this.prisma.product.findMany({
      where: filters?.type ? { type: filters.type } : {},
      orderBy: { createdAt: "desc" },
    });
  }
}
