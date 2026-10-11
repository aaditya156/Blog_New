import mongoose, { Document, Schema } from "mongoose";

export interface IBlog extends Document<string> {
  _id: string; // Synced with AuthorBlog ID
  title: string;
  description: string;
  content: string;
  banner?: {
    public_id?: string;
    url: string;
  };
  tags: string[];
  category: string;
  author?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  isPublished: boolean;
  views: number;
  likes: string[];
  likesCount: number;
  score: number;
  embedding: number[];
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    _id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: "text",
    },
    description: {
      type: String,
      required: true,
      trim: true,
      index: "text",
    },
    content: {
      type: String,
      required: true,
    },
    banner: {
      public_id: { type: String, default: "" },
      url: {
        type: String,
        default: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
      },
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    category: {
      type: String,
      default: "Technology",
      index: true,
    },
    author: {
      type: String,
    },
    authorId: {
      type: String,
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorAvatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      index: true,
    },
    likes: {
      type: [String],
      default: [],
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
      index: true,
    },
    embedding: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
    _id: false, // We supply our own _id string from AuthorBlog
  }
);

// Sorting and search indexes
blogSchema.index({ score: -1, createdAt: -1 });
blogSchema.index({ views: -1, createdAt: -1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ title: "text", description: "text", tags: "text" });

export const Blog = mongoose.model<IBlog>("Blog", blogSchema);
