import amqp from "amqplib";

// amqplib v0.10+ returns ChannelModel from connect()
type ChannelModel = Awaited<ReturnType<typeof amqp.connect>>;

let connection: ChannelModel | null = null;
let channel: amqp.Channel | null = null;

const EXCHANGE_NAME = "blog_exchange";
const ROUTING_KEY = "blog.event";

export const connectRabbitMQ = async (): Promise<amqp.Channel | null> => {
  if (channel) return channel;

  const rabbitUrl = process.env.RABBITMQ_URL || "amqp://guest:guest@127.0.0.1:5672";

  try {
    connection = await amqp.connect(rabbitUrl);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });
    console.log("[Author Service] Connected to RabbitMQ Publisher Exchange");

    connection.on("error", (err: Error) => {
      console.error("[Author Service] RabbitMQ Connection error:", err);
      channel = null;
      connection = null;
    });

    connection.on("close", () => {
      console.warn("[Author Service] RabbitMQ Connection closed. Reconnecting...");
      channel = null;
      connection = null;
      setTimeout(connectRabbitMQ, 5000);
    });

    return channel;
  } catch (error) {
    console.error("[Author Service] RabbitMQ Connection failed:", error);
    setTimeout(connectRabbitMQ, 5000);
    return null;
  }
};

export interface BlogEventMessage {
  eventType: "BLOG_CREATED" | "BLOG_UPDATED" | "BLOG_DELETED";
  data: any;
  timestamp: string;
}

export const publishBlogEvent = async (event: BlogEventMessage): Promise<boolean> => {
  try {
    if (!channel) {
      await connectRabbitMQ();
    }

    if (!channel) {
      console.error("[Author Service] RabbitMQ channel unavailable, cannot publish event.");
      return false;
    }

    const payload = Buffer.from(JSON.stringify(event));
    channel.publish(EXCHANGE_NAME, ROUTING_KEY, payload, { persistent: true });
    console.log(`[Author Service] Published event [${event.eventType}] for blog ID: ${event.data?._id || event.data?.id}`);
    return true;
  } catch (error) {
    console.error("[Author Service] Error publishing RabbitMQ event:", error);
    return false;
  }
};
