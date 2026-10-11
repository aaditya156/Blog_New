"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useApp } from "../../../context/AppContext";
import {
  PenSquare,
  Sparkles,
  Send,
  Image as ImageIcon,
  Tag,
  Folder,
  CheckCircle2,
  AlertCircle,
  Radio,
} from "lucide-react";

export default function CreateBlogPage() {
  const router = useRouter();
  const { user, token, AUTHOR_API, isLoading } = useApp();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Technology");
  const [tags, setTags] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !content) {
      setErrorMsg("Title, short description, and content are required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await axios.post(
        `${AUTHOR_API}/blog`,
        {
          title,
          description,
          content,
          category,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          bannerUrl: bannerUrl || undefined,
          authorName: user?.name,
          authorAvatar: user?.avatar?.url,
          isPublished: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccessMsg("Publication broadcasted successfully to RabbitMQ & synced!");
        setTimeout(() => {
          router.push(`/blog/${response.data.blog._id}`);
        }, 1200);
      }
    } catch (err: any) {
      console.error("Publication error", err);
      setErrorMsg(err.response?.data?.message || "Failed to publish article. Check backend services.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <PenSquare className="w-7 h-7 text-indigo-600" />
            Author Publishing Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create content that instantly publishes via Author Service and queues for synchronization on RabbitMQ.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 font-medium">
          <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
          AMQP Event Stream Active
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Article Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Scaling Microservices with RabbitMQ and Node.js"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-lg font-bold text-slate-900 placeholder-slate-400 shadow-xs outline-none transition"
          />
        </div>

        {/* Short summary / subtitle */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Short Summary / Subtitle
          </label>
          <input
            type="text"
            required
            placeholder="A compelling 1-2 sentence overview of your post"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm text-slate-900 placeholder-slate-400 shadow-xs outline-none transition"
          />
        </div>

        {/* Category & Tags Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-indigo-600" />
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm text-slate-900 shadow-xs outline-none transition"
            >
              <option value="Technology">Technology</option>
              <option value="Microservices">Microservices</option>
              <option value="AI & ML">AI & Machine Learning</option>
              <option value="Web Development">Web Development</option>
              <option value="DevOps & Cloud">DevOps & Cloud</option>
              <option value="Architecture">Software Architecture</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-600" />
              Tags (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. nodejs, rabbitmq, docker, express"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm text-slate-900 placeholder-slate-400 shadow-xs outline-none transition"
            />
          </div>
        </div>

        {/* Banner image URL */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
            Cover Image URL (Optional)
          </label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/photo-..."
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm text-slate-900 placeholder-slate-400 shadow-xs outline-none transition"
          />
        </div>

        {/* Article Body Content */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Article Content (Markdown / Text)
          </label>
          <textarea
            required
            rows={12}
            placeholder="Write your insightful story here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm text-slate-900 placeholder-slate-400 shadow-xs outline-none font-sans leading-relaxed transition"
          />
        </div>

        {/* Action button */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50 transition"
          >
            {submitting ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{submitting ? "Publishing..." : "Publish to Microservices"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
