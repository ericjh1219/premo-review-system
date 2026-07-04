export type ReviewTemplate = {
  id: string;
  text: string;
};

function buildReviewTemplates(businessName: string): Record<string, ReviewTemplate[]> {
  const name = businessName || "this business";

  return {
    Rednote: [
      { id: "rn-1", text: `Had an amazing time at ${name}! The photos turned out incredible 📸✨` },
      { id: "rn-2", text: `${name} exceeded my expectations — professional, friendly, and so much fun!` },
      {
        id: "rn-3",
        text: `If you're looking for the best experience, ${name} is it! Highly recommend 💯`,
      },
    ],
    "Instagram Story": [{ id: "ig-1", text: `Loved my time at ${name}! 🎉` }],
    Facebook: [{ id: "fb-1", text: `${name} was fantastic — highly recommend to anyone in the area!` }],
  };
}

/**
 * Returns the review templates a customer can choose from for a platform,
 * personalized with the business's own name. Falls back to a single
 * generated template (using the business's configured instruction text when
 * available) so every platform always has at least one.
 */
export function getReviewTemplates(
  platform: string,
  businessName: string,
  fallbackText?: string
): ReviewTemplate[] {
  const templates = buildReviewTemplates(businessName)[platform];
  if (templates && templates.length > 0) return templates;

  return [
    {
      id: `${platform}-default`,
      text: fallbackText?.trim() || `Check out ${businessName || "us"} on ${platform}!`,
    },
  ];
}
