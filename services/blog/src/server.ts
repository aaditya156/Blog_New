import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./utils/db";
import { startRabbitMQConsumer } from "./utils/consumer";
import blogRoutes from "./routes/blogRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4003;

// Initialize Database connection and RabbitMQ Consumer
connectDB();
startRabbitMQConsumer();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Health check route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "healthy", service: "blog-service" });
});

// API Routes
app.use("/api/v1/blog", blogRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[Blog Service Error]:", err);
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({
    success: false,
    message,
  });
});

app.listen(PORT, () => {
  console.log(`📖 [Blog Service] running on http://localhost:${PORT}`);
});
