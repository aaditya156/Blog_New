import { ChromaClient } from "chromadb";

const CHROMA_COLLECTION_NAME = "blog_embeddings";

let clientInstance: ChromaClient | null = null;

/**
 * Returns a singleton ChromaClient instance.
 */
export const getChromaClient = (): ChromaClient => {
  if (!clientInstance) {
    const chromaUrl = process.env.CHROMA_URL || "http://127.0.0.1:8005";
    try {
      const url = new URL(chromaUrl);
      clientInstance = new ChromaClient({
        ssl: url.protocol === "https:",
        host: url.hostname,
        port: parseInt(url.port, 10) || 8000,
      });
    } catch {
      clientInstance = new ChromaClient({ path: chromaUrl });
    }
  }
  return clientInstance;
};

/**
 * Gets or creates the blog vector collection with cosine similarity space.
 */
export const getBlogCollection = async () => {
  const client = getChromaClient();
  return await client.getOrCreateCollection({
    name: CHROMA_COLLECTION_NAME,
    metadata: { "hnsw:space": "cosine" },
  });
};

/**
 * Upserts a blog vector embedding, document text, and metadata into ChromaDB.
 */
export const upsertBlogToChroma = async (
  blogId: string,
  embedding: number[],
  metadata: {
    title?: string;
    category?: string;
    authorId?: string;
    authorName?: string;
    isPublished?: boolean;
  },
  documentText?: string
): Promise<void> => {
  try {
    if (!embedding || embedding.length === 0) {
      return;
    }

    const collection = await getBlogCollection();

    // ChromaDB metadatas require primitive string/number/boolean types
    const sanitizedMetadata: Record<string, string | number | boolean> = {
      title: metadata.title || "",
      category: metadata.category || "",
      authorId: metadata.authorId || "",
      authorName: metadata.authorName || "",
      isPublished: metadata.isPublished ?? true,
    };

    await collection.upsert({
      ids: [blogId],
      embeddings: [embedding],
      metadatas: [sanitizedMetadata],
      documents: [documentText || metadata.title || ""],
    });

    console.log(`[ChromaDB] Successfully indexed vector for blog ${blogId}`);
  } catch (error) {
    console.error(`[ChromaDB] Error upserting embedding for blog ${blogId}:`, error);
  }
};

/**
 * Deletes a blog's embedding from ChromaDB.
 */
export const deleteBlogFromChroma = async (blogId: string): Promise<void> => {
  try {
    const collection = await getBlogCollection();
    await collection.delete({
      ids: [blogId],
    });
    console.log(`[ChromaDB] Successfully deleted vector for blog ${blogId}`);
  } catch (error) {
    console.error(`[ChromaDB] Error deleting blog ${blogId} from Chroma:`, error);
  }
};

/**
 * Queries ChromaDB for the top K most semantically similar blogs.
 */
export const querySimilarBlogsFromChroma = async (
  queryEmbedding: number[],
  nResults: number = 20
): Promise<{ id: string; distance: number; similarity: number; metadata: any }[]> => {
  try {
    const collection = await getBlogCollection();
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults,
    });

    if (!results || !results.ids || results.ids.length === 0 || results.ids[0].length === 0) {
      return [];
    }

    const ids = results.ids[0];
    const distances = (results.distances && results.distances[0]) || [];
    const metadatas = (results.metadatas && results.metadatas[0]) || [];

    return ids.map((id, index) => {
      const distance = distances[index] ?? 0;
      // In cosine space, cosine_distance = 1 - cosine_similarity
      const similarity = 1 - distance;
      return {
        id,
        distance,
        similarity,
        metadata: metadatas[index] || {},
      };
    });
  } catch (error) {
    console.error("[ChromaDB] Error querying similar blogs from Chroma:", error);
    return [];
  }
};
