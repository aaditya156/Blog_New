import React from "react";
import Link from "next/link";
import { BlogItem } from "../context/AppContext";
import { formatDate, calculateReadingTime } from "../lib/utils";
import { Eye, Heart, Calendar, ArrowUpRight, Sparkles } from "lucide-react";

interface BlogCardProps {
  blog: BlogItem;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  return (
    <div className="group relative flex flex-col bg-white border border-slate-200/80 hover:border-indigo-300/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1">
      {/* Banner image */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
        <img
          src={blog.banner?.url || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80"}
          alt={blog.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-indigo-700 backdrop-blur-md shadow-xs border border-white/60">
            {blog.category || "Technology"}
          </span>
          {typeof blog.semanticScore === "number" && blog.semanticScore > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white backdrop-blur-md shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-300" />
              {Math.round(blog.semanticScore * 100)}% Match
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(blog.createdAt)}
            </span>
            <span>•</span>
            <span>{calculateReadingTime(blog.content)}</span>
          </div>

          {/* Title */}
          <Link href={`/blog/${blog._id}`}>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2 flex items-center justify-between">
              <span>{blog.title}</span>
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 shrink-0 ml-1" />
            </h3>
          </Link>

          {/* Description */}
          <p className="text-sm text-slate-600 line-clamp-2 mb-4">
            {blog.description}
          </p>
        </div>

        {/* Footer info: Author & Stats */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Link
            href={`/profile/${blog.authorId}`}
            className="flex items-center gap-2 group/author"
          >
            <img
              src={blog.authorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
              alt={blog.authorName}
              className="w-7 h-7 rounded-full object-cover border border-slate-200 group-hover/author:border-indigo-400 transition"
            />
            <span className="text-xs font-medium text-slate-700 group-hover/author:text-indigo-600 transition">
              {blog.authorName}
            </span>
          </Link>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              {blog.views || 0}
            </span>
            <span className="flex items-center gap-1 text-pink-500">
              <Heart className="w-3.5 h-3.5 fill-pink-500/20 text-pink-500" />
              {blog.likes?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
