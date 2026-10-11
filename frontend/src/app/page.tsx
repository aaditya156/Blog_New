"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useApp, BlogItem } from "../context/AppContext";
import { BlogCard } from "../components/BlogCard";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Radio,
  BookOpen,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const { BLOG_API } = useApp();
  const [trendingBlogs, setTrendingBlogs] = useState<BlogItem[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingRes, latestRes] = await Promise.all([
          axios.get(`${BLOG_API}/trending?limit=3`).catch(() => ({ data: { blogs: [] } })),
          axios.get(`${BLOG_API}?limit=6`).catch(() => ({ data: { blogs: [] } })),
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
  }, [BLOG_API]);

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
            Write with lightning speed on dedicated Author Services, sync asynchronously through RabbitMQ, and deliver ultra-responsive reading feeds globally.
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
              <p className="text-xs text-slate-500">Auth, Profiles & OAuth verification on port 4001</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs text-left hover:border-pink-200 transition">
              <div className="flex items-center gap-2 text-pink-600 text-sm font-semibold mb-1">
                <Zap className="w-4 h-4" />
                Author Service
              </div>
              <p className="text-xs text-slate-500">Content Studio & Event Producer on port 4002</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs text-left hover:border-violet-200 transition">
              <div className="flex items-center gap-2 text-violet-600 text-sm font-semibold mb-1">
                <BookOpen className="w-4 h-4" />
                Blog Service
              </div>
              <p className="text-xs text-slate-500">Aggregated Read Replica on port 4003</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs text-left hover:border-amber-200 transition">
              <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold mb-1">
                <Cpu className="w-4 h-4" />
                RabbitMQ
              </div>
              <p className="text-xs text-slate-500">Asynchronous AMQP pub/sub topic broker</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Trending Stories</h2>
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
              <div key={i} className="h-80 rounded-2xl bg-white animate-pulse border border-slate-200 shadow-xs" />
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
            <p className="text-xs text-slate-500 mt-1 mb-4">Be the first author to publish a story!</p>
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recent Publications</h2>
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
              <div key={i} className="h-80 rounded-2xl bg-white animate-pulse border border-slate-200 shadow-xs" />
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
