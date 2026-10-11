/**
 * Client-side user interest tracking for AI Semantic Vector Recommendations.
 * Stores recent reading history and liked articles in localStorage.
 */

const READ_HISTORY_KEY = "blog_semantic_read_history";
const LIKED_HISTORY_KEY = "blog_semantic_liked_history";
const MAX_HISTORY_ITEMS = 12;

export function trackBlogRead(blogId: string): void {
  if (typeof window === "undefined" || !blogId) return;

  try {
    const raw = localStorage.getItem(READ_HISTORY_KEY);
    const history: string[] = raw ? JSON.parse(raw) : [];

    // Filter out if already exists, then prepend
    const updated = [blogId, ...history.filter((id) => id !== blogId)].slice(
      0,
      MAX_HISTORY_ITEMS
    );

    localStorage.setItem(READ_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to track blog read:", e);
  }
}

export function trackBlogLiked(blogId: string, isLiked: boolean): void {
  if (typeof window === "undefined" || !blogId) return;

  try {
    const raw = localStorage.getItem(LIKED_HISTORY_KEY);
    const history: string[] = raw ? JSON.parse(raw) : [];

    let updated: string[];
    if (isLiked) {
      updated = [blogId, ...history.filter((id) => id !== blogId)].slice(
        0,
        MAX_HISTORY_ITEMS
      );
    } else {
      updated = history.filter((id) => id !== blogId);
    }

    localStorage.setItem(LIKED_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to track blog like:", e);
  }
}

export function getUserInteractionBlogIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const likedRaw = localStorage.getItem(LIKED_HISTORY_KEY);
    const readRaw = localStorage.getItem(READ_HISTORY_KEY);

    const liked: string[] = likedRaw ? JSON.parse(likedRaw) : [];
    const read: string[] = readRaw ? JSON.parse(readRaw) : [];

    // Liked blogs take priority, followed by read blogs
    const combined = Array.from(new Set([...liked, ...read]));
    return combined.slice(0, MAX_HISTORY_ITEMS);
  } catch {
    return [];
  }
}
