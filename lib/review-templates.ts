import { loadPosts } from "@/lib/post-storage";

export type ReviewTemplate = {
  id: string;
  text: string;
};

/**
 * Builds the share/review templates a customer can pick from for a
 * platform, sourced directly from the business's own Active posts tagged
 * for that platform. There is no hardcoded review text — if the business
 * hasn't created an active post for this platform, this returns an empty
 * array and the caller should skip straight to opening the platform link.
 */
export function getReviewTemplates(businessId: string, platform: string): ReviewTemplate[] {
  return loadPosts(businessId)
    .filter((post) => post.status === "active" && post.socialPlatform === platform)
    .map((post) => ({ id: post.id, text: post.description }));
}
