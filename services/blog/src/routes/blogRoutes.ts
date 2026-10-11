import express from "express";
import {
  getAllBlogs,
  getTrendingBlogs,
  getBlogById,
  toggleLikeBlog,
  getCategories,
  getSemanticPersonalizedFeed,
} from "../controllers/blogController";
import { isAuth } from "../middleware/isAuth";

const router = express.Router();

router.get("/trending", getTrendingBlogs);
router.get("/categories", getCategories);
router.get("/semantic-feed", getSemanticPersonalizedFeed);
router.post("/semantic-feed", getSemanticPersonalizedFeed);
router.get("/:id", getBlogById);
router.get("/", getAllBlogs);
router.post("/:id/like", isAuth, toggleLikeBlog);

export default router;
