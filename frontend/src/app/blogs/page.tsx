"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useApp, BlogItem } from "../../context/AppContext";
import { BlogCard } from "../../components/BlogCard";
import { getUserInteractionBlogIds } from "../../lib/recommendations";
import { Search, Filter, Sparkles, BookOpen } from "lucide-react";

export default function BlogsExplorePage() {
  const { BLOG_API } = useApp();
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>([
    "All",
    "AI Recommended",
  ]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${BLOG_API}/categories`);
        if (res.data.success && res.data.categories.length > 0) {
          setCategories(["All", "AI Recommended", ...res.data.categories]);
        } else {
          setCategories([
            "All",
            "AI Recommended",
            "Technology",
            "System Design",
            "Web Development",
            "AI & Machine Learning",
            "DevOps",
          ]);
        }
      } catch (err) {
        setCategories([
          "All",
          "AI Recommended",
          "Technology",
          "System Design",
          "Web Development",
          "AI & Machine Learning",
          "DevOps",
        ]);
      }
    };
    fetchCategories();
  }, [BLOG_API]);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        // If "AI Recommended" is selected, query the semantic feed endpoint
        if (selectedCategory === "AI Recommended") {
          const interactionIds = getUserInteractionBlogIds();
          const res = await axios.post(`${BLOG_API}/semantic-feed`, {
            blogIds: interactionIds,
            limit: 9,
          });

          if (res.data.success && res.data.blogs) {
            setBlogs(res.data.blogs);
            setTotalPages(1);
          }
          return;
        }

        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        if (selectedCategory && selectedCategory !== "All")
          params.append("category", selectedCategory);
        params.append("page", page.toString());
        params.append("limit", "9");

        const res = await axios.get(`${BLOG_API}?${params.toString()}`);
        if (res.data.success) {
          setBlogs(res.data.blogs);
          setTotalPages(res.data.totalPages || 1);
        }
      } catch (err) {
        console.error("Error fetching blogs", err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchBlogs, 300);
    return () => clearTimeout(debounce);
  }, [BLOG_API, searchTerm, selectedCategory, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-indigo-600" />
          Explore Publications
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Discover stories, system architectures, and technical deep-dives aggregated in real-time across microservices and ChromaDB AI vector search.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, keyword, or tag..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block shrink-0 ml-2" />
          {categories.map((cat) => {
            const isAI = cat === "AI Recommended";
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  isSelected
                    ? isAI
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs"
                      : "bg-indigo-600 text-white shadow-xs"
                    : isAI
                    ? "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 border border-transparent"
                }`}
              >
                {isAI && <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Blog Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-white animate-pulse border border-slate-200 shadow-xs"
            />
          ))}
        </div>
      ) : blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 shadow-xs">
          <Sparkles className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-base text-slate-800 font-semibold">
            No publications found
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or selecting another category.
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && selectedCategory !== "AI Recommended" && (
        <div className="flex justify-center items-center gap-3 pt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 shadow-xs transition"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500">
            Page <span className="text-indigo-600 font-semibold">{page}</span> of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-50 shadow-xs transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
