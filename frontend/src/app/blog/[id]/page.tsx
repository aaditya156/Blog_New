"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useApp, BlogItem } from "../../../context/AppContext";
import { formatDate, calculateReadingTime } from "../../../lib/utils";
import MarkdownRenderer from "../../../components/MarkdownRenderer";
import {
  Heart,
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Eye,
  Check,
  Tag,
  BookOpen,
  Sparkles,
  ChevronRight,
  User,
} from "lucide-react";

export default function BlogDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { BLOG_API, token, user } = useApp();

  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track reading progress on scroll
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      try {
        const res = await axios.get(`${BLOG_API}/${id}`);
        if (res.data.success) {
          const blogData = res.data.blog;
          setBlog(blogData);
          setLikesCount(blogData.likes?.length || 0);
          if (user && blogData.likes?.includes(user._id)) {
            setIsLiked(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch blog post", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, BLOG_API, user]);

  const handleLike = async () => {
    if (!user || !token) {
      router.push("/login");
      return;
    }

    if (likeLoading || !blog) return;
    setLikeLoading(true);

    try {
      const res = await axios.post(
        `${BLOG_API}/${blog._id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likesCount);
      }
    } catch (err) {
      console.error("Failed to like blog", err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-6 w-24 bg-slate-200 rounded-lg" />
          <div className="h-6 w-28 bg-slate-200 rounded-full" />
        </div>
        <div className="space-y-4">
          <div className="h-12 w-4/5 bg-slate-200 rounded-2xl" />
          <div className="h-6 w-2/3 bg-slate-200 rounded-lg" />
        </div>
        <div className="h-16 w-full bg-slate-100 rounded-2xl border border-slate-200" />
        <div className="h-96 w-full bg-slate-200 rounded-3xl" />
        <div className="space-y-4">
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-11/12 bg-slate-200 rounded" />
          <div className="h-4 w-5/6 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-28 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
          <BookOpen className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Article Not Found
          </h2>
          <p className="text-slate-500 text-base max-w-md mx-auto">
            The article you are searching for might have been moved, removed, or is temporarily unavailable.
          </p>
        </div>
        <div>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Explore All Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200/50 z-50">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-8">
        {/* Breadcrumb Navigation & Category Pill */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500">
            <Link
              href="/"
              className="hover:text-indigo-600 transition"
            >
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              href="/blogs"
              className="hover:text-indigo-600 transition"
            >
              Articles
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-700 font-semibold truncate max-w-[180px] sm:max-w-xs">
              {blog.category}
            </span>
          </nav>

          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50/90 text-indigo-700 border border-indigo-200/80 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            {blog.category || "Technology"}
          </span>
        </div>

        {/* Article Header & Typography */}
        <header className="space-y-5">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            {blog.title}
          </h1>

          {blog.description && (
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              {blog.description}
            </p>
          )}

          {/* Author Meta & Action Bar */}
          <div className="pt-4 pb-4 border-y border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
            {/* Author Profile Info */}
            <Link
              href={`/profile/${blog.authorId}`}
              className="flex items-center gap-3.5 group"
            >
              <img
                src={
                  blog.authorAvatar ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
                }
                alt={blog.authorName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-slate-200 group-hover:ring-indigo-500 transition duration-200"
              />
              <div>
                <p className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1.5">
                  {blog.authorName}
                </p>
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 font-medium mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(blog.createdAt)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {calculateReadingTime(blog.content)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    {(blog.views || 0).toLocaleString()} views
                  </span>
                </div>
              </div>
            </Link>

            {/* Interaction Buttons (Like & Share) */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleLike}
                disabled={likeLoading}
                aria-label="Like this article"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs ${
                  isLiked
                    ? "bg-rose-50 text-rose-600 border border-rose-200 ring-2 ring-rose-100"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                <Heart
                  className={`w-4 h-4 transition-transform active:scale-125 ${
                    isLiked
                      ? "fill-rose-500 text-rose-500"
                      : "text-slate-400 group-hover:text-rose-500"
                  }`}
                />
                <span>{likesCount}</span>
              </button>

              <button
                onClick={handleShare}
                aria-label="Share article"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-xs transition"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-slate-400" />
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Featured Hero Banner */}
        {blog.banner?.url && (
          <div className="w-full h-72 sm:h-96 lg:h-[460px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative bg-slate-100">
            <img
              src={blog.banner.url}
              alt={blog.title}
              className="w-full h-full object-cover hover:scale-[1.01] transition duration-500 ease-out"
            />
          </div>
        )}

        {/* Article Body Content (Rendered via MarkdownRenderer) */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
          <MarkdownRenderer content={blog.content} />
        </div>

        {/* Interactive Tags Section */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              <span>Related Topics & Tags</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {blog.tags.map((tag, idx) => (
                <Link
                  key={idx}
                  href={`/blogs?tag=${encodeURIComponent(tag)}`}
                  className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100/80 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200/80 transition duration-150 shadow-2xs"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio Showcase Card */}
        <div className="bg-gradient-to-br from-white to-slate-50/80 rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={
              blog.authorAvatar ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
            }
            alt={blog.authorName}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-sm ring-2 ring-slate-200 shrink-0"
          />
          <div className="space-y-3 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Written by {blog.authorName}
                </h3>
                <p className="text-xs text-indigo-600 font-semibold">
                  Contributing Author • {blog.category}
                </p>
              </div>
              <Link
                href={`/profile/${blog.authorId}`}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>View Author Profile</span>
              </Link>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Passionate engineer and writer exploring architectures, modern engineering patterns, and scalable systems.
            </p>
          </div>
        </div>

        {/* Bottom Back Button */}
        <div className="pt-4 text-center">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm border border-slate-200 shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Explore All Articles
          </Link>
        </div>
      </article>
    </div>
  );
}
