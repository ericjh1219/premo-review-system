import type { Post } from "@/lib/mock-data";

function storageKey(businessId: string) {
  return `premo-posts:${businessId}`;
}

/**
 * Loads a business's posts, scoped by business id. Every business starts
 * with an empty content library — there is no shared demo/seed data.
 */
export function loadPosts(businessId: string): Post[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(storageKey(businessId));
    return raw ? (JSON.parse(raw) as Post[]) : [];
  } catch {
    return [];
  }
}

export function savePosts(businessId: string, posts: Post[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(businessId), JSON.stringify(posts));
}
