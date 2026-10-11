import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blog_author_db";
    const conn = await mongoose.connect(mongoUri);
    console.log(`[Author Service] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("[Author Service] MongoDB connection error:", error);
    process.exit(1);
  }
};
