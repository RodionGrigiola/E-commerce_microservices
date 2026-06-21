import { logger, RabbitMQClient } from "@ecom/shared";
import { env } from "./config/env";
import { prisma } from "./db/prisma";

export const rabbitClient = new RabbitMQClient(env.RABBIT_URL);

export async function setupRabbitMQSubscriptions() {
  try {
    // await rabbitClient.subscribe(
    //   "products-service.account-registered",
    //   EcomEvent.ACCOUNT_REGISTERED,
    //   async (payload) => {
    //     await prisma.userProfile.create({
    //       data: {
    //         id: payload.id,
    //         email: payload.email,
    //         createdAt: new Date(payload.createdAt),
    //       },
    //     });
    //   },
    // );

    logger.info("[RabbitMQ] Products subscriptions successfully initialized");
  } catch (error) {
    logger.error("[RabbitMQ] Failed to initialize subscriptions", error);
    process.exit(1);
  }
}
