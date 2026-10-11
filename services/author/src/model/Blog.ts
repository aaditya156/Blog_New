import mongoose, { Document, Schema } from "mongoose";

export interface IAuthorBlog extends Document {
  title: string;
  description: string;
  content: string;
  banner?: {
    public_id?: string;
    url: string;
  };
  tags: string[];
  category: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  isPublished: boolean;
  views: number;
  likes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const authorBlogSchema = new Schema<IAuthorBlog>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Blog content is required"],
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
    },
    category: {
      type: String,
      default: "Technology",
    },
    authorId: {
      type: String,
      required: [true, "Author ID is required"],
      index: true,
    },
    authorName: {
      type: String,
      required: [true, "Author Name is required"],
    },
    authorAvatar: {
      type: String,
      default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const AuthorBlog = mongoose.model<IAuthorBlog>("AuthorBlog", authorBlogSchema);
