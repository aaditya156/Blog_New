import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface BlogRequestUser {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface BlogAuthenticatedRequest extends Request {
  user?: BlogRequestUser;
}

export const isAuth = async (
  req: BlogAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Please login to perform this action",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET || "your_jwt_super_secret_key_123";

    const decoded = jwt.verify(token, jwtSecret) as { id: string; name?: string; email?: string; role?: string };

    req.user = {
      _id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const optionalAuth = async (
  req: BlogAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  try {
    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET || "your_jwt_super_secret_key_123";
    const decoded = jwt.verify(token, jwtSecret) as { id: string; name?: string; email?: string; role?: string };

    req.user = {
      _id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (err) {
    // Silently continue for optional auth
  }

  next();
};
