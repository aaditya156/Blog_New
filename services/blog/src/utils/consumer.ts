import amqp from "amqplib";
import { Blog } from "../model/Blog";
import { generateEmbedding } from "./embeddings";
import { upsertBlogToChroma, deleteBlogFromChroma } from "./chroma";

type ChannelModel = Awaited<ReturnType<typeof amqp.connect>>;

let connection: ChannelModel | null = null;
let channel: amqp.Channel | null = null;

const EXCHANGE_NAME = "blog_exchange";
const QUEUE_NAME = "blog_sync_queue";
const ROUTING_KEY = "blog.#";

/**
 * Builds a concatenated text representation of the blog for semantic embedding generation.
 */
const buildTextForEmbedding = (data: any): string => {
  const tagsText = Array.isArray(data?.tags)
    ? data.tags.join(" ")
    : typeof data?.tags === "string"
    ? data.tags
    : "";

  return [data?.title, data?.description, data?.category, tagsText]
    .filter(Boolean)
    .join(" ")
    .trim();
};

export const startRabbitMQConsumer = async (): Promise<void> => {
  const rabbitUrl = process.env.RABBITMQ_URL || "amqp://guest:guest@127.0.0.1:5672";

  try {
    connection = await amqp.connect(rabbitUrl);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });
    const q = await channel.assertQueue(QUEUE_NAME, { durable: true });

    await channel.bindQueue(q.queue, EXCHANGE_NAME, ROUTING_KEY);
    await channel.prefetch(1);

    console.log(`[Blog Service] RabbitMQ Consumer listening on queue "${q.queue}"`);

    channel.consume(
      q.queue,
      async (msg: amqp.Message | null) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());
          const { eventType, data } = content;

          console.log(`[Blog Service] Received event [${eventType}] for item: ${data?._id || data?.id}`);

          switch (eventType) {
            case "BLOG_CREATED": {
              const textToEmbed = buildTextForEmbedding(data);
              const embedding = await generateEmbedding(textToEmbed);

              const blogId = (data._id || data.id).toString();
              const blogData = {
                ...data,
                _id: blogId,
                embedding,
                likesCount: data.likesCount ?? (Array.isArray(data.likes) ? data.likes.length : 0),
                score: data.score ?? 0,
              };

              // Persist document in MongoDB
              await Blog.findByIdAndUpdate(blogData._id, blogData, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
              });

              // Index vector embedding into ChromaDB
              await upsertBlogToChroma(
                blogData._id,
                embedding,
                {
                  title: data.title,
                  category: data.category,
                  authorId: data.authorId,
                  authorName: data.authorName,
                  isPublished: data.isPublished,
                },
                textToEmbed
              );

              console.log(`[Blog Service] Successfully synced new blog ${blogData._id} with embedding and ChromaDB`);
              break;
            }

            case "BLOG_UPDATED": {
              const blogId = (data._id || data.id).toString();
              const textToEmbed = buildTextForEmbedding(data);
              const embedding = await generateEmbedding(textToEmbed);

              // Update document in MongoDB
              await Blog.findByIdAndUpdate(
                blogId,
                {
                  $set: {
                    title: data.title,
                    description: data.description,
                    content: data.content,
                    category: data.category,
                    tags: data.tags,
                    banner: data.banner,
                    isPublished: data.isPublished,
                    embedding,
                    likesCount: data.likesCount ?? (Array.isArray(data.likes) ? data.likes.length : 0),
                    score: data.score,
                    updatedAt: data.updatedAt || new Date(),
                  },
                },
                { upsert: true }
              );

              // Update vector in ChromaDB
              await upsertBlogToChroma(
                blogId,
                embedding,
                {
                  title: data.title,
                  category: data.category,
                  authorId: data.authorId,
                  authorName: data.authorName,
                  isPublished: data.isPublished,
                },
                textToEmbed
              );

              console.log(`[Blog Service] Successfully synced blog update ${blogId} with embedding and ChromaDB`);
              break;
            }

            case "BLOG_DELETED": {
              const blogId = (data._id ? data._id.toString() : data.id).toString();
              await Blog.findByIdAndDelete(blogId);
              await deleteBlogFromChroma(blogId);
              console.log(`[Blog Service] Successfully removed deleted blog ${blogId} from MongoDB and ChromaDB`);
              break;
            }

            default:
              console.warn(`[Blog Service] Unknown eventType received: ${eventType}`);
          }

          channel?.ack(msg);
        } catch (err) {
          console.error("[Blog Service] Failed to process RabbitMQ event:", err);
          // Negative acknowledgement with requeue if transient, or dead-letter in production
          channel?.nack(msg, false, false);
        }
      },
      { noAck: false }
    );

    connection.on("error", (err) => {
      console.error("[Blog Service] RabbitMQ connection error:", err);
      channel = null;
      connection = null;
    });

    connection.on("close", () => {
      console.warn("[Blog Service] RabbitMQ connection closed. Retrying in 5 seconds...");
      channel = null;
      connection = null;
      setTimeout(startRabbitMQConsumer, 5000);
    });
  } catch (error) {
    console.error("[Blog Service] RabbitMQ Consumer startup failed:", error);
    setTimeout(startRabbitMQConsumer, 5000);
  }
};
