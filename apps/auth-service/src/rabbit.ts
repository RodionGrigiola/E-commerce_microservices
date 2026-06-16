import { EcomEvent, logger, RabbitMQClient } from "@ecom/shared";
import { prisma } from "./db/prisma";
import { env } from "./config/env";

export const rabbitClient = new RabbitMQClient(env.RABBIT_URL);

export async function setupRabbitMQSubscriptions() {
  try {
    await rabbitClient.subscribe(
      "auth-service.profile-updated",
      EcomEvent.PROFILE_UPDATED,
      async (payload) => {
        if (payload.email) {
          await prisma.authUser.update({
            where: { id: payload.id },
            data: { email: payload.email },
          });
        }
      },
    );

    await rabbitClient.subscribe(
      "auth-service.profile-deleted",
      EcomEvent.PROFILE_DELETED,
      async (payload) => {
        console.log("PAYLOAD IN AUTH: ", payload);
        await prisma.authUser.delete({
          where: { id: payload.id },
        });
      },
    );

    logger.info("[RabbitMQ] Auth subscriptions successfully initialized");
  } catch (error) {
    logger.error("[RabbitMQ] Failed to initialize subscriptions", error);
    process.exit(1);
  }
}
