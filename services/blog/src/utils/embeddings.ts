/**
 * Utility for generating local semantic embeddings using @xenova/transformers.
 * Model: Xenova/all-MiniLM-L6-v2 (384-dimensional dense vectors)
 */

const VECTOR_DIMENSION = 384;
const DEFAULT_MODEL = "Xenova/all-MiniLM-L6-v2";
const TASK = "feature-extraction";

class EmbeddingPipelineSingleton {
  private static instance: any = null;
  private static loadingPromise: Promise<any> | null = null;

  public static async getInstance(): Promise<any> {
    if (this.instance) {
      return this.instance;
    }

    if (!this.loadingPromise) {
      this.loadingPromise = (async () => {
        try {
          // Dynamic import supports both ESM and CJS environments seamlessly
          const { pipeline } = await import("@xenova/transformers");
          const extractor = await pipeline(TASK, DEFAULT_MODEL);
          this.instance = extractor;
          return extractor;
        } catch (error) {
          console.error("[Embeddings] Failed to initialize pipeline:", error);
          this.loadingPromise = null;
          throw error;
        }
      })();
    }

    return this.loadingPromise;
  }
}

/**
 * Generates a normalized 384-dimensional float vector for the given input text.
 * Falls back to a zero-vector of 384 dimensions if processing or model loading fails.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const fallbackVector = new Array(VECTOR_DIMENSION).fill(0);

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return fallbackVector;
  }

  try {
    const extractor = await EmbeddingPipelineSingleton.getInstance();
    const output = await extractor(text, {
      pooling: "mean",
      normalize: true,
    });

    if (output && output.data) {
      return Array.from(output.data);
    }

    return fallbackVector;
  } catch (error) {
    console.error("[Embeddings] Error during generateEmbedding execution:", error);
    return fallbackVector;
  }
}
