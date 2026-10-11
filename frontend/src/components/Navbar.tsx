"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "../context/AppContext";
import {
  PenSquare,
  Compass,
  BookOpen,
  LogOut,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

export const Navbar = () => {
  const { user, logout } = useApp();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-1">
              Pulse<span className="text-indigo-600">Blog</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium -mt-1 tracking-wider uppercase">Microservice Platform</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              isActive("/") ? "text-indigo-600 font-semibold" : "text-slate-600 hover:text-indigo-600"
            }`}
          >
            <Compass className="w-4 h-4" />
            Home
          </Link>
          <Link
            href="/blogs"
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              isActive("/blogs") ? "text-indigo-600 font-semibold" : "text-slate-600 hover:text-indigo-600"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Explore
          </Link>

          {user && (
            <Link
              href="/blog/new"
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                isActive("/blog/new") ? "text-indigo-600 font-semibold" : "text-slate-600 hover:text-indigo-600"
              }`}
            >
              <PenSquare className="w-4 h-4" />
              Write
            </Link>
          )}
        </nav>

        {/* User / CTA Action */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href={`/profile/${user._id}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition"
              >
                <img
                  src={user.avatar?.url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-slate-800">{user.name}</span>
              </Link>
              <button
                onClick={logout}
                title="Log Out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 transition"
              >
                Log In
              </Link>
              <Link
                href="/login?mode=register"
                className="text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/20 transition duration-200"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 bg-white border-b border-slate-200 shadow-lg space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            href="/blogs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Explore Blogs
          </Link>
          {user && (
            <Link
              href="/blog/new"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50"
            >
              Write a Blog
            </Link>
          )}
          {user ? (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={`/profile/${user._id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2"
              >
                <img
                  src={user.avatar?.url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-slate-800">{user.name}</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="text-rose-600 text-sm font-medium hover:underline"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 rounded-lg bg-slate-100 text-slate-700 font-medium"
              >
                Log In
              </Link>
              <Link
                href="/login?mode=register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 rounded-lg bg-indigo-600 text-white font-medium shadow-md shadow-indigo-500/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
