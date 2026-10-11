"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: {
    url: string;
  };
  bio?: string;
  role: string;
}

export interface BlogItem {
  _id: string;
  title: string;
  description: string;
  content: string;
  banner?: {
    url: string;
  };
  tags: string[];
  category: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  views: number;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
  USER_API: string;
  AUTHOR_API: string;
  BLOG_API: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const USER_API = process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:4001/api/v1/user";
  const AUTHOR_API = process.env.NEXT_PUBLIC_AUTHOR_SERVICE_URL || "http://localhost:4002/api/v1/author";
  const BLOG_API = process.env.NEXT_PUBLIC_BLOG_SERVICE_URL || "http://localhost:4003/api/v1/blog";

  useEffect(() => {
    const savedToken = localStorage.getItem("blog_auth_token");
    const savedUser = localStorage.getItem("blog_auth_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Failed to parse saved user", err);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (authToken: string, userData: User) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem("blog_auth_token", authToken);
    localStorage.setItem("blog_auth_user", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("blog_auth_token");
    localStorage.removeItem("blog_auth_user");
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("blog_auth_user", JSON.stringify(userData));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        updateUser,
        USER_API,
        AUTHOR_API,
        BLOG_API,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
