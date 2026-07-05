import type { Post } from "@/lib/mock-data";
import { loadPosts } from "@/lib/post-storage";

export type ReviewTemplate = {
  id: string;
  text: string;
};

/**
 * Pure filter over an already-loaded list of Posts. Split out from
 * getReviewTemplates so synchronous UI code (e.g. the Share Page, which
 * needs a template count on every render/click) can derive templates from
 * posts already held in state, without awaiting a fetch each time.
 *
 * There is no hardcoded review text — if the business hasn't created an
 * active post for this platform, this returns an empty array and the
 * caller should skip straight to opening the platform link.
 *
 * For Google Review specifically, a categoryId can be passed to further
 * scope results to posts assigned to that Google Review Category (see
 * lib/review-categories.ts). Posts remain the single source of truth for
 * review text — categories only group them.
 */
export function filterReviewTemplates(
  posts: Post[],
  platform: string,
  categoryId?: string | null
): ReviewTemplate[] {
  return posts
    .filter((post) => {
      if (post.status !== "active" || post.socialPlatform !== platform) return false;
      if (platform === "Google Review" && categoryId) return post.categoryId === categoryId;
      return true;
    })
    .map((post) => ({ id: post.id, text: post.description }));
}

/**
 * Builds the share/review templates a customer can pick from for a
 * platform, sourced directly from the business's own Active posts tagged
 * for that platform. Loads posts from the Posts API, then applies the same
 * filter as filterReviewTemplates.
 */
export async function getReviewTemplates(
  businessId: string,
  platform: string,
  categoryId?: string | null
): Promise<ReviewTemplate[]> {
  const posts = await loadPosts(businessId);
  return filterReviewTemplates(posts, platform, categoryId);
}
