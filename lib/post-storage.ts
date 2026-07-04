import { DEMO_BUSINESS } from "@/lib/business";
import { posts as DEMO_SEED_POSTS, type Post } from "@/lib/mock-data";

function storageKey(businessId: string) {
  return `premo-posts:${businessId}`;
}

/**
 * Loads a business's posts, scoped by business id. The demo business is
 * seeded with the existing example posts on first load; any other business
 * starts empty until it creates its own.
 */
export function loadPosts(businessId: string): Post[] {
  if (typeof window === "undefined") {
    return businessId === DEMO_BUSINESS.id ? DEMO_SEED_POSTS : [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey(businessId));
    if (raw) return JSON.parse(raw) as Post[];

    const seed = businessId === DEMO_BUSINESS.id ? DEMO_SEED_POSTS : [];
    savePosts(businessId, seed);
    return seed;
  } catch {
    return businessId === DEMO_BUSINESS.id ? DEMO_SEED_POSTS : [];
  }
}

export function savePosts(businessId: string, posts: Post[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(businessId), JSON.stringify(posts));
}
