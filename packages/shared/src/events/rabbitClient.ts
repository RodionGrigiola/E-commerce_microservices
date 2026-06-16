import amqp, {
  AmqpConnectionManager,
  ChannelWrapper,
} from "amqp-connection-manager";
import { EcomEvent, EcomEventPayloads } from "./contracts";
import { logger } from "../lib/logger";

export class RabbitMQClient {
  private connection: AmqpConnectionManager;
  private channel: ChannelWrapper;
  private exchangeName = "ecom.main.exchange";

  constructor(rabbitUrl: string) {
    this.connection = amqp.connect([rabbitUrl]);

    this.connection.on("connect", () =>
      logger.info("[RabbitMQ] Successfully connected to broker"),
    );
    this.connection.on("disconnect", (err) =>
      logger.error("[RabbitMQ] Disconnected from broker", err),
    );

    this.channel = this.connection.createChannel({
      json: true,
      setup: (channel: any) => {
        return channel.assertExchange(this.exchangeName, "topic", {
          durable: true,
        });
      },
    });
  }

  public async publish<T extends EcomEvent>(
    event: T,
    payload: EcomEventPayloads[T],
  ): Promise<void> {
    try {
      await this.channel.publish(this.exchangeName, event, payload, {
        persistent: true,
      });
      logger.info(`[RabbitMQ] Event published: ${event}`, { payload });
    } catch (error) {
      logger.error(`[RabbitMQ] Failed to publish event ${event}`, error);
      throw error;
    }
  }

  /**
   * Подписка на событие с автоматическим созданием очереди
   */
  public async subscribe<T extends EcomEvent>(
    queueName: string,
    event: T,
    onMessage: (payload: EcomEventPayloads[T]) => Promise<void>,
  ): Promise<void> {
    await this.channel.addSetup((channel: any) => {
      return Promise.all([
        // 1. Создаем износостойкую очередь для конкретного микросервиса
        channel.assertQueue(queueName, { durable: true }),
        // 2. Связываем очередь с Exchange по ключу события (Routing Key)
        channel.bindQueue(queueName, this.exchangeName, event),
        // 3. Начинаем слушать сообщения
        channel.consume(queueName, async (msg: any) => {
          if (!msg) return;

          try {
            const content = JSON.parse(msg.content.toString());
            logger.info(
              `[RabbitMQ] Event received: ${event} in queue ${queueName}`,
            );

            await onMessage(content);

            channel.ack(msg);
          } catch (error) {
            logger.error(
              `[RabbitMQ] Error handling event ${event} in queue ${queueName}`,
              error,
            );
            channel.nack(msg, false, true);
          }
        }),
      ]);
    });
  }
}
