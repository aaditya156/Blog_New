"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useApp, BlogItem, User as UserType } from "../../../context/AppContext";
import { BlogCard } from "../../../components/BlogCard";
import { Mail, BookOpen, Sparkles } from "lucide-react";

export default function UserProfilePage() {
  const { id } = useParams();
  const { USER_API, BLOG_API } = useApp();

  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProfileData = async () => {
      try {
        const [userRes, blogsRes] = await Promise.all([
          axios.get(`${USER_API}/profile/${id}`).catch(() => ({ data: { user: null } })),
          axios.get(`${BLOG_API}?authorId=${id}`).catch(() => ({ data: { blogs: [] } })),
        ]);

        if (userRes.data.user) {
          setProfileUser(userRes.data.user);
        }
        setBlogs(blogsRes.data.blogs || []);
      } catch (err) {
        console.error("Failed to fetch author profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id, USER_API, BLOG_API]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-slate-200" />
          <div className="space-y-3">
            <div className="h-6 w-48 bg-slate-200 rounded" />
            <div className="h-4 w-32 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Profile Header Card */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left relative z-10">
          <img
            src={
              profileUser?.avatar?.url ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80"
            }
            alt={profileUser?.name || "Author"}
            className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-md"
          />

          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {profileUser?.name || "Author Profile"}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 self-center sm:self-auto">
                {profileUser?.role?.toUpperCase() || "AUTHOR"}
              </span>
            </div>

            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              {profileUser?.bio || "Technical contributor and writer on the PulseBlog network."}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-2">
              {profileUser?.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  {profileUser.email}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                {blogs.length} Articles Published
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Author Publications Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Publications by {profileUser?.name || "this author"}
        </h2>

        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-dashed border-slate-200 bg-white shadow-xs">
            <p className="text-slate-500 text-sm">No articles published by this author yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
