export type PlatformField = "title" | "description" | "images" | "video";

/**
 * Declares which Create Post fields apply to each social platform.
 * Add a new platform here to control its form fields — no component changes needed.
 * Platforms not listed here fall back to showing every field (see DEFAULT_PLATFORM_FIELDS).
 */
export const PLATFORM_FIELDS: Record<string, PlatformField[]> = {
  Rednote: ["title", "description", "images", "video"],
  Facebook: ["description", "images", "video"],
  Instagram: ["description", "images", "video"],
  TikTok: ["description", "video"],
  "Google Review": ["description"],
  WeChat: ["description", "images", "video"],
  Lemon8: ["title", "description", "images"],
};

const DEFAULT_PLATFORM_FIELDS: PlatformField[] = ["title", "description", "images", "video"];

export function getPlatformFields(platform: string): PlatformField[] {
  return PLATFORM_FIELDS[platform] ?? DEFAULT_PLATFORM_FIELDS;
}
