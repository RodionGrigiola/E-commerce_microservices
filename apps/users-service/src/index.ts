import { app } from "./app";
import { env } from "./config/env";
import { setupRabbitMQSubscriptions } from "./rabbit";
import { logger } from "@ecom/shared";

async function startServer() {
  await setupRabbitMQSubscriptions();

  app.listen(env.PORT, () => {
    logger.info(`Users microservice successfully started`, { port: env.PORT });
  });
}

startServer();
