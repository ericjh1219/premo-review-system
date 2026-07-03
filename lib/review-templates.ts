export type ReviewTemplate = {
  id: string;
  text: string;
};

const REVIEW_TEMPLATES: Record<string, ReviewTemplate[]> = {
  Rednote: [
    {
      id: "rn-1",
      text: "Had an amazing time at Premo Studio! The photos turned out incredible 📸✨",
    },
    {
      id: "rn-2",
      text: "Premo Studio exceeded my expectations — professional, friendly, and so much fun!",
    },
    {
      id: "rn-3",
      text: "If you're looking for the best photo studio experience, Premo Studio is it! Highly recommend 💯",
    },
  ],
  "Instagram Story": [
    { id: "ig-1", text: "Loved my session at @premo_studio! 🎉" },
  ],
  Facebook: [
    {
      id: "fb-1",
      text: "Premo Studio was fantastic — highly recommend to anyone in the area!",
    },
  ],
};

/**
 * Returns the review templates a customer can choose from for a platform.
 * Falls back to a single generated template (using the business's configured
 * instruction text when available) so every platform always has at least one.
 */
export function getReviewTemplates(platform: string, fallbackText?: string): ReviewTemplate[] {
  const templates = REVIEW_TEMPLATES[platform];
  if (templates && templates.length > 0) return templates;

  return [
    {
      id: `${platform}-default`,
      text: fallbackText?.trim() || `Check out Premo Studio on ${platform}!`,
    },
  ];
}
