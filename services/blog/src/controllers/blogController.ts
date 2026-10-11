import { Request, Response } from "express";
import { Blog } from "../model/Blog";
import { TryCatch } from "../utils/TryCatch";
import { BlogAuthenticatedRequest } from "../middleware/isAuth";
import { querySimilarBlogsFromChroma } from "../utils/chroma";

/**
 * Calculates the cosine similarity between two numeric vectors.
 * Returns a score between -1 and 1 (or 0 if either vector is empty/zero).
 */
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// @desc   Get semantic personalized recommendation feed using ChromaDB and cosine similarity
// @route  POST /api/v1/blog/semantic-feed or GET /api/v1/blog/semantic-feed
export const getSemanticPersonalizedFeed = TryCatch(async (req: Request, res: Response) => {
  // Support userVector from req.body or req.query
  let userVector: number[] | null = null;

  if (req.body && Array.isArray(req.body.userVector)) {
    userVector = req.body.userVector.map((v: any) => Number(v)).filter((v: any) => !isNaN(v));
  } else if (req.query.userVector) {
    try {
      const raw = req.query.userVector;
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed)) {
        userVector = parsed.map((v: any) => Number(v)).filter((v: any) => !isNaN(v));
      }
    } catch {
      if (typeof req.query.userVector === "string") {
        userVector = req.query.userVector
          .split(",")
          .map((v) => Number(v.trim()))
          .filter((v) => !isNaN(v));
      }
    }
  }

  // If user vector provided, query ChromaDB first for fast ANN search
  if (userVector && userVector.length > 0) {
    try {
      const chromaMatches = await querySimilarBlogsFromChroma(userVector, 20);

      if (chromaMatches && chromaMatches.length > 0) {
        const blogIds = chromaMatches.map((m) => m.id);
        const blogs = await Blog.find({ _id: { $in: blogIds }, isPublished: true }).lean();

        // Create ID to blog map and attach semantic score
        const blogMap = new Map(blogs.map((b) => [b._id.toString(), b]));
        const orderedBlogs = chromaMatches
          .map((match) => {
            const blog = blogMap.get(match.id);
            if (!blog) return null;
            return {
              ...blog,
              semanticScore: match.similarity,
              distance: match.distance,
            };
          })
          .filter(Boolean);

        if (orderedBlogs.length > 0) {
          return res.status(200).json({
            success: true,
            mode: "chromadb_semantic",
            total: orderedBlogs.length,
            blogs: orderedBlogs,
          });
        }
      }
    } catch (chromaErr) {
      console.warn("[Blog Controller] ChromaDB query failed, falling back to in-memory cosine similarity:", chromaErr);
    }

    // In-memory fallback if ChromaDB returned no results or is unavailable
    const blogs = await Blog.find({ isPublished: true }).lean();

    const scoredBlogs = blogs
      .map((blog) => {
        const similarity =
          blog.embedding && Array.isArray(blog.embedding) && blog.embedding.length > 0
            ? cosineSimilarity(userVector!, blog.embedding)
            : 0;
        return {
          ...blog,
          semanticScore: similarity,
        };
      })
      .sort((a, b) => b.semanticScore - a.semanticScore)
      .slice(0, 20);

    return res.status(200).json({
      success: true,
      mode: "in_memory_semantic",
      total: scoredBlogs.length,
      blogs: scoredBlogs,
    });
  }

  // Fallback to traditional score-based sorting if no user vector is provided
  const fallbackBlogs = await Blog.find({ isPublished: true })
    .sort({ score: -1, views: -1, createdAt: -1 })
    .limit(20)
    .lean();

  return res.status(200).json({
    success: true,
    mode: "traditional_score_fallback",
    total: fallbackBlogs.length,
    blogs: fallbackBlogs,
  });
});

// @desc   Fetch all published blogs with search, filters, and pagination
// @route  GET /api/v1/blog
export const getAllBlogs = TryCatch(async (req: Request, res: Response) => {
  const { search, category, tag, authorId, page = "1", limit = "10" } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const query: any = { isPublished: true };

  if (category && category !== "All") {
    query.category = { $regex: new RegExp(`^${category}$`, "i") };
  }

  if (tag) {
    query.tags = { $in: [new RegExp(tag as string, "i")] };
  }

  if (authorId) {
    query.authorId = authorId;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search as string, $options: "i" } },
      { description: { $regex: search as string, $options: "i" } },
      { tags: { $in: [new RegExp(search as string, "i")] } },
    ];
  }

  const [blogs, total] = await Promise.all([
    Blog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Blog.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    blogs,
  });
});

// @desc   Fetch trending / popular blogs
// @route  GET /api/v1/blog/trending
export const getTrendingBlogs = TryCatch(async (req: Request, res: Response) => {
  const limitNum = Math.min(10, parseInt((req.query.limit as string) || "5", 10));

  const blogs = await Blog.find({ isPublished: true })
    .sort({ views: -1, createdAt: -1 })
    .limit(limitNum);

  return res.status(200).json({
    success: true,
    blogs,
  });
});

// @desc   Fetch a single blog by ID & increment view count
// @route  GET /api/v1/blog/:id
export const getBlogById = TryCatch(async (req: Request, res: Response) => {
  const { id } = req.params;

  const blog = await Blog.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog post not found",
    });
  }

  return res.status(200).json({
    success: true,
    blog,
  });
});

// @desc   Toggle like / unlike on a blog
// @route  POST /api/v1/blog/:id/like
export const toggleLikeBlog = TryCatch(async (req: BlogAuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Please login to like this blog",
    });
  }

  const blog = await Blog.findById(id);
  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog post not found",
    });
  }

  const isLiked = blog.likes.includes(userId);

  if (isLiked) {
    blog.likes = blog.likes.filter((uid) => uid !== userId);
  } else {
    blog.likes.push(userId);
  }

  blog.likesCount = blog.likes.length;
  await blog.save();

  return res.status(200).json({
    success: true,
    message: isLiked ? "Blog unliked" : "Blog liked",
    likesCount: blog.likes.length,
    isLiked: !isLiked,
  });
});

// @desc   Fetch all distinct categories
// @route  GET /api/v1/blog/categories
export const getCategories = TryCatch(async (req: Request, res: Response) => {
  const categories = await Blog.distinct("category", { isPublished: true });
  return res.status(200).json({
    success: true,
    categories,
  });
});
