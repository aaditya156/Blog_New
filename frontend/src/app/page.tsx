"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
import { useApp, BlogItem } from "../context/AppContext";
import { BlogCard } from "../components/BlogCard";
import { getUserInteractionBlogIds } from "../lib/recommendations";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Radio,
  BookOpen,
  Zap,
  RefreshCw,
  Compass,
} from "lucide-react";

export default function HomePage() {
  const { BLOG_API } = useApp();
  const [recommendedBlogs, setRecommendedBlogs] = useState<BlogItem[]>([]);
  const [trendingBlogs, setTrendingBlogs] = useState<BlogItem[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(true);
  const [recMode, setRecMode] = useState<string>("chromadb_semantic");
  const [hasInteractions, setHasInteractions] = useState(false);

  // Fetch AI Semantic Recommendations
  const fetchRecommendations = useCallback(async () => {
    setRecLoading(true);
    try {
      const interactionIds = getUserInteractionBlogIds();
      setHasInteractions(interactionIds.length > 0);

      const res = await axios.post(
        `${BLOG_API}/semantic-feed`,
        {
          blogIds: interactionIds,
          limit: 3,
        },
        { timeout: 7000 }
      );

      if (res.data.success && res.data.blogs?.length > 0) {
        setRecommendedBlogs(res.data.blogs);
        setRecMode(res.data.mode || "chromadb_semantic");
      } else {
        // Fallback
        const fallbackRes = await axios.get(`${BLOG_API}/trending?limit=3`);
        setRecommendedBlogs(fallbackRes.data.blogs || []);
      }
    } catch (err) {
      console.warn("Semantic feed fetch failed, falling back to trending", err);
      try {
        const fallbackRes = await axios.get(`${BLOG_API}/trending?limit=3`);
        setRecommendedBlogs(fallbackRes.data.blogs || []);
      } catch {}
    } finally {
      setRecLoading(false);
    }
  }, [BLOG_API]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingRes, latestRes] = await Promise.all([
          axios
            .get(`${BLOG_API}/trending?limit=3`)
            .catch(() => ({ data: { blogs: [] } })),
          axios
            .get(`${BLOG_API}?limit=6`)
            .catch(() => ({ data: { blogs: [] } })),
        ]);

        setTrendingBlogs(trendingRes.data.blogs || []);
        setLatestBlogs(latestRes.data.blogs || []);
      } catch (err) {
        console.error("Failed to load home page feed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchRecommendations();
  }, [BLOG_API, fetchRecommendations]);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 border-b border-slate-200/80 bg-gradient-to-b from-indigo-50/50 via-slate-50/30 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 text-indigo-700 text-xs font-semibold tracking-wide shadow-xs">
            <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            Decoupled Microservice Architecture
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Next-Gen Blogging Powered by{" "}
            <span className="gradient-text">Event-Driven</span> Microservices
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Write with lightning speed on dedicated Author Services, sync asynchronously through RabbitMQ, and discover content via ChromaDB vector embeddings.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/blogs"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-md shadow-indigo-500/20 transition duration-200"
            >
              <BookOpen className="w-4 h-4" />
              Start Reading
            </Link>
            <Link
              href="/blog/new"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold shadow-xs transition duration-200"
            >
              <Zap className="w-4 h-4 text-indigo-600" />
              Publish an Article
            </Link>
          </div>

          {/* Microservice Architecture Pill Bar */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs text-left hover:border-indigo-200 transition">
              <div className="flex items-center gap-2 text-indigo-600 text-sm font-semibold mb-1">
                <Layers className="w-4 h-4" />
                User Service
              </div>
              <p className="text-xs text-slate-500">Auth, Profiles & OAuth on port 4001</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs text-left hover:border-pink-200 transition">
              <div className="flex items-center gap-2 text-pink-600 text-sm font-semibold mb-1">
                <Zap className="w-4 h-4" />
                Author Service
              </div>
              <p className="text-xs text-slate-500">Editor Studio & Producer on port 4002</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs text-left hover:border-violet-200 transition">
              <div className="flex items-center gap-2 text-violet-600 text-sm font-semibold mb-1">
                <BookOpen className="w-4 h-4" />
                Blog Service
              </div>
              <p className="text-xs text-slate-500">Read Replica & Cache on port 4003</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs text-left hover:border-purple-200 transition">
              <div className="flex items-center gap-2 text-purple-600 text-sm font-semibold mb-1">
                <Cpu className="w-4 h-4" />
                ChromaDB Vector AI
              </div>
              <p className="text-xs text-slate-500">Semantic ANN Embeddings on port 8005</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended For You (AI Semantic Feed Section) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-white rounded-3xl p-6 sm:p-8 border border-indigo-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                <span>AI Semantic Recommendation Engine</span>
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-bold">
                  {recMode.includes("chroma") ? "ChromaDB HNSW" : "Cosine ANN"}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Recommended For You
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {hasInteractions
                  ? "Tailored dynamically in real-time to your recent reading & liked articles using 384-d vector embeddings."
                  : "Discover stories based on semantic topic clustering and vector embeddings."}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={fetchRecommendations}
                disabled={recLoading}
                aria-label="Refresh recommendations"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-slate-500 ${
                    recLoading ? "animate-spin" : ""
                  }`}
                />
                <span>Refresh AI Feed</span>
              </button>
              <Link
                href="/blogs"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {recLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-80 rounded-2xl bg-white animate-pulse border border-slate-200 shadow-xs"
                />
              ))}
            </div>
          ) : recommendedBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-indigo-200">
              <Compass className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-slate-800 font-semibold text-sm">
                No recommendations yet
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Read or like an article to start building your personalized semantic vector profile!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Trending Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Trending Stories
            </h2>
          </div>
          <Link
            href="/blogs"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-white animate-pulse border border-slate-200 shadow-xs"
              />
            ))}
          </div>
        ) : trendingBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-white shadow-xs">
            <Sparkles className="w-8 h-8 text-indigo-500 mx-auto mb-3 opacity-60" />
            <p className="text-slate-800 font-semibold">No published blogs yet</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Be the first author to publish a story!
            </p>
            <Link
              href="/blog/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-xs transition"
            >
              Write First Post
            </Link>
          </div>
        )}
      </section>

      {/* Latest Articles Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Recent Publications
          </h2>
          <Link
            href="/blogs"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Explore Library <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-white animate-pulse border border-slate-200 shadow-xs"
              />
            ))}
          </div>
        ) : latestBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-sm">
            Publish your first blog to see real-time updates through RabbitMQ!
          </div>
        )}
      </section>
    </div>
  );
}
