import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./utils/db";
import userRoutes from "./routes/userRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Health check route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "healthy", service: "user-service" });
});

// API Routes
app.use("/api/v1/user", userRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[User Service Error]:", err);
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({
    success: false,
    message,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 [User Service] running on http://localhost:${PORT}`);
});
