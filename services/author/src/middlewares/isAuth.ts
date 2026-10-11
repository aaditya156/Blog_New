import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthorUserPayload {
  _id: string;
  name: string;
  email: string;
  avatar?: {
    url: string;
  };
  role: string;
}

export interface AuthorAuthenticatedRequest extends Request {
  user?: AuthorUserPayload;
}

export const isAuth = async (
  req: AuthorAuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Please login as author to perform this action",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET || "your_jwt_super_secret_key_123";

    const decoded = jwt.verify(token, jwtSecret) as { id: string; name?: string; email?: string; role?: string };

    req.user = {
      _id: decoded.id,
      name: decoded.name || "Author",
      email: decoded.email || "",
      role: decoded.role || "author",
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired author authorization token",
    });
  }
};
