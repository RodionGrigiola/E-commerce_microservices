import { PrismaClient, ProductType } from "../src/generated/prisma";

const prisma = new PrismaClient();

const initialProducts = [
  {
    sku: "COF-ETH-001",
    name: "Ethiopia Yirgacheffe",
    description:
      "Freshly roasted coffee beans with bright notes of citrus, bergamot, and floral undertones.",
    price: 12.5,
    type: ProductType.COFFEE,
    stock: 50,
    attributes: { roastLevel: 2, processing: "Washed", region: "Yirgacheffe" },
  },
  {
    sku: "COF-BRA-002",
    name: "Brazil Cerrado",
    description:
      "Classic medium-bodied coffee featuring rich notes of milk chocolate, caramel, and toasted nuts.",
    price: 9.9,
    type: ProductType.COFFEE,
    stock: 100,
    attributes: { roastLevel: 3, processing: "Natural", region: "Cerrado" },
  },
  {
    sku: "TEA-GUL-001",
    name: "Tie Guan Yin",
    description:
      "Premium light oolong tea with a vibrant orchid aroma and a refreshing, sweet aftertaste.",
    price: 8.0,
    type: ProductType.TEA,
    stock: 30,
    attributes: {
      teaType: "Oolong",
      leafSize: "Whole Loose Leaf",
      province: "Anxi",
    },
  },
  {
    sku: "TEA-PUE-002",
    name: "Shu Pu-erh 2020",
    description:
      "Aged ripe pu-erh tea cake delivering a deep, earthy aroma with smooth woody flavors.",
    price: 18.0,
    type: ProductType.TEA,
    stock: 15,
    attributes: { teaType: "Dark/Puerh", form: "Compressed Cake", ageYears: 6 },
  },
];

async function main() {
  console.log("[Prisma Seed] Starting database seeding...");

  for (const product of initialProducts) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {}, // If product exists, do nothing
      create: product, // If product does not exist, insert it
    });
  }

  console.log("[Prisma Seed] Database successfully seeded! 🌱");
}

main()
  .catch((e) => {
    console.error("[Prisma Seed] Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
