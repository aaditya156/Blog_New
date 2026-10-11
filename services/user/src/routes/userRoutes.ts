import express from "express";
import {
  registerUser,
  loginUser,
  googleAuth,
  getMyProfile,
  getUserProfile,
  updateProfile,
} from "../controllers/userController";
import { isAuth } from "../middleware/isAuth";
import { singleUpload } from "../middleware/multer";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.get("/profile/:id", getUserProfile);

// Protected routes
router.get("/me", isAuth, getMyProfile);
router.put("/profile", isAuth, singleUpload, updateProfile);

export default router;
