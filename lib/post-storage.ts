import type { Post } from "@/lib/mock-data";

/**
 * Loads a business's posts, scoped by business id, from the Posts API.
 * Every business starts with an empty content library — there is no shared
 * demo/seed data.
 */
export async function loadPosts(businessId: string): Promise<Post[]> {
  try {
    const res = await fetch(`/api/posts?businessId=${encodeURIComponent(businessId)}`);
    if (!res.ok) return [];
    return (await res.json()) as Post[];
  } catch {
    return [];
  }
}

export async function savePosts(businessId: string, posts: Post[]): Promise<void> {
  try {
    await fetch(`/api/posts?businessId=${encodeURIComponent(businessId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(posts),
    });
  } catch {
    // Matches the previous localStorage implementation, which never
    // surfaced a write failure to the caller either.
  }
}
