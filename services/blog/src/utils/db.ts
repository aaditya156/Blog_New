import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blog_read_db";
    const conn = await mongoose.connect(mongoUri);
    console.log(`[Blog Service] MongoDB Read Replica / Aggregate DB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("[Blog Service] MongoDB connection error:", error);
    process.exit(1);
  }
};
