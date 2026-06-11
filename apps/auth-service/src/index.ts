import { logger } from "@ecom/shared";
import { app } from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  logger.info(`Auth microservice successfully started`, { port: env.PORT });
});
