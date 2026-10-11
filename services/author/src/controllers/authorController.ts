import { Response } from "express";
import { AuthorBlog } from "../model/Blog";
import { TryCatch } from "../utils/TryCatch";
import { AuthorAuthenticatedRequest } from "../middlewares/isAuth";
import { publishBlogEvent } from "../utils/rabbitmq";

// @desc   Create a new blog post
// @route  POST /api/v1/author/blog
export const createBlog = TryCatch(async (req: AuthorAuthenticatedRequest, res: Response) => {
  const { title, description, content, tags, category, bannerUrl, isPublished, authorName, authorAvatar } = req.body;

  if (!title || !description || !content) {
    return res.status(400).json({
      success: false,
      message: "Please provide title, description, and content",
    });
  }

  const authorId = req.user?._id;
  if (!authorId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized author",
    });
  }

  const parsedTags = Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((t: string) => t.trim()) : [];

  const blog = await AuthorBlog.create({
    title,
    description,
    content,
    tags: parsedTags,
    category: category || "General",
    banner: {
      url: bannerUrl || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
    },
    authorId,
    authorName: authorName || req.user?.name || "Author",
    authorAvatar: authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
    isPublished: isPublished !== undefined ? isPublished : true,
  });

  // Asynchronously broadcast to RabbitMQ for Blog Service synchronization
  await publishBlogEvent({
    eventType: "BLOG_CREATED",
    data: blog.toObject(),
    timestamp: new Date().toISOString(),
  });

  return res.status(201).json({
    success: true,
    message: "Blog created successfully",
    blog,
  });
});

// @desc   Update an existing blog post
// @route  PUT /api/v1/author/blog/:id
export const updateBlog = TryCatch(async (req: AuthorAuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const authorId = req.user?._id;

  const blog = await AuthorBlog.findOne({ _id: id, authorId });
  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found or unauthorized to edit",
    });
  }

  const { title, description, content, tags, category, bannerUrl, isPublished } = req.body;

  if (title) blog.title = title;
  if (description) blog.description = description;
  if (content) blog.content = content;
  if (category) blog.category = category;
  if (isPublished !== undefined) blog.isPublished = isPublished;
  if (tags) {
    blog.tags = Array.isArray(tags) ? tags : tags.split(",").map((t: string) => t.trim());
  }
  if (bannerUrl) {
    blog.banner = {
      ...blog.banner,
      url: bannerUrl,
    };
  }

  await blog.save();

  // Asynchronously publish update event to RabbitMQ
  await publishBlogEvent({
    eventType: "BLOG_UPDATED",
    data: blog.toObject(),
    timestamp: new Date().toISOString(),
  });

  return res.status(200).json({
    success: true,
    message: "Blog updated successfully",
    blog,
  });
});

// @desc   Delete a blog post
// @route  DELETE /api/v1/author/blog/:id
export const deleteBlog = TryCatch(async (req: AuthorAuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const authorId = req.user?._id;

  const blog = await AuthorBlog.findOneAndDelete({ _id: id, authorId });
  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found or unauthorized to delete",
    });
  }

  // Publish delete event to RabbitMQ
  await publishBlogEvent({
    eventType: "BLOG_DELETED",
    data: { _id: id, authorId },
    timestamp: new Date().toISOString(),
  });

  return res.status(200).json({
    success: true,
    message: "Blog deleted successfully",
  });
});

// @desc   Get all blogs written by the current author
// @route  GET /api/v1/author/my-blogs
export const getMyAuthorBlogs = TryCatch(async (req: AuthorAuthenticatedRequest, res: Response) => {
  const authorId = req.user?._id;

  const blogs = await AuthorBlog.find({ authorId }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: blogs.length,
    blogs,
  });
});

// @desc   Get single blog details for author editing
// @route  GET /api/v1/author/blog/:id
export const getAuthorBlogById = TryCatch(async (req: AuthorAuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const authorId = req.user?._id;

  const blog = await AuthorBlog.findOne({ _id: id, authorId });
  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found",
    });
  }

  return res.status(200).json({
    success: true,
    blog,
  });
});
