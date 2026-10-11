import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../model/User";
import { TryCatch } from "../utils/TryCatch";
import { AuthenticatedRequest } from "../middleware/isAuth";
import { verifyGoogleToken } from "../utils/GoogleConfig";

const generateToken = (id: string): string => {
  const secret = process.env.JWT_SECRET || "your_jwt_super_secret_key_123";
  return jwt.sign({ id }, secret, { expiresIn: "7d" });
};

// @desc   Register user
// @route  POST /api/v1/user/register
export const registerUser = TryCatch(async (req: Request, res: Response) => {
  const { name, email, password, bio } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide name, email, and password",
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User already exists with this email",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    bio: bio || "",
  });

  const token = generateToken(user._id.toString());

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
    },
  });
});

// @desc   Login user
// @route  POST /api/v1/user/login
export const loginUser = TryCatch(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.password) {
    return res.status(400).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const token = generateToken(user._id.toString());

  return res.status(200).json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
    },
  });
});

// @desc   Google OAuth Login/Signup
// @route  POST /api/v1/user/google
export const googleAuth = TryCatch(async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({
      success: false,
      message: "Google ID Token is required",
    });
  }

  const payload = await verifyGoogleToken(idToken);
  if (!payload || !payload.email) {
    return res.status(400).json({
      success: false,
      message: "Invalid Google token",
    });
  }

  let user = await User.findOne({ email: payload.email });

  if (!user) {
    user = await User.create({
      name: payload.name || "Google User",
      email: payload.email,
      googleId: payload.sub,
      avatar: {
        url: payload.picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
      },
      role: "author",
    });
  }

  const token = generateToken(user._id.toString());

  return res.status(200).json({
    success: true,
    message: "Google authentication successful",
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
    },
  });
});

// @desc   Get current logged-in user profile
// @route  GET /api/v1/user/me
export const getMyProfile = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

// @desc   Get public user profile by ID
// @route  GET /api/v1/user/profile/:id
export const getUserProfile = TryCatch(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    success: true,
    user,
  });
});

// @desc   Update current profile
// @route  PUT /api/v1/user/profile
export const updateProfile = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const { name, bio, avatarUrl } = req.body;
  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (avatarUrl) {
    user.avatar = {
      ...user.avatar,
      url: avatarUrl,
    };
  }

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});
