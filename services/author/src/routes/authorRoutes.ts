import express from "express";
import {
  createBlog,
  updateBlog,
  deleteBlog,
  getMyAuthorBlogs,
  getAuthorBlogById,
} from "../controllers/authorController";
import { isAuth } from "../middlewares/isAuth";
import { singleUpload } from "../middlewares/multer";

const router = express.Router();

// All author routes require author authentication
router.post("/blog", isAuth, singleUpload, createBlog);
router.put("/blog/:id", isAuth, singleUpload, updateBlog);
router.delete("/blog/:id", isAuth, deleteBlog);
router.get("/my-blogs", isAuth, getMyAuthorBlogs);
router.get("/blog/:id", isAuth, getAuthorBlogById);

export default router;
