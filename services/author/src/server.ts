import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./utils/db";
import { connectRabbitMQ } from "./utils/rabbitmq";
import authorRoutes from "./routes/authorRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;

// Initialize MongoDB & RabbitMQ connections
connectDB();
connectRabbitMQ();

// Middlewares
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Health check route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "healthy", service: "author-service" });
});

// API Routes
app.use("/api/v1/author", authorRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[Author Service Error]:", err);
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({
    success: false,
    message,
  });
});

app.listen(PORT, () => {
  console.log(`✍️  [Author Service] running on http://localhost:${PORT}`);
});
