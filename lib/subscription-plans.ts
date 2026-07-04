export type SubscriptionPlanId = "basic" | "pro" | "enterprise";

export type PlanFeatureAvailability = "included" | "coming-soon";

export type SubscriptionPlanFeature = {
  label: string;
  availability: PlanFeatureAvailability;
};

export type SubscriptionPlanDefinition = {
  id: SubscriptionPlanId;
  name: string;
  priceLabel: string;
  monthlyAiCredits: number;
  branchLimit: number;
  luckyDrawEnabled: boolean;
  features: SubscriptionPlanFeature[];
};

/**
 * The single source of truth for what each plan tier includes. Super Admin
 * uses this to prefill sensible defaults when assigning a plan to a
 * business, but the business's own subscription record (lib/business.ts)
 * stores its own copies of these values so they can be overridden per
 * business without changing this catalog.
 */
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, SubscriptionPlanDefinition> = {
  basic: {
    id: "basic",
    name: "Basic",
    priceLabel: "RM199/month",
    monthlyAiCredits: 30,
    branchLimit: 1,
    luckyDrawEnabled: false,
    features: [
      { label: "1 Business", availability: "included" },
      { label: "1 Branch", availability: "included" },
      { label: "30 Monthly AI Credits", availability: "included" },
      { label: "Unlimited QR Codes", availability: "included" },
      { label: "Unlimited Google Review Categories", availability: "included" },
      { label: "Lucky Draw", availability: "coming-soon" },
      { label: "Customer CRM", availability: "coming-soon" },
      { label: "AI Review Generator", availability: "coming-soon" },
      { label: "AI Social Caption Generator", availability: "coming-soon" },
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceLabel: "RM399/month",
    monthlyAiCredits: 120,
    branchLimit: 1,
    luckyDrawEnabled: true,
    features: [
      { label: "1 Business", availability: "included" },
      { label: "1 Branch", availability: "included" },
      { label: "120 Monthly AI Credits", availability: "included" },
      { label: "Unlimited QR Codes", availability: "included" },
      { label: "Unlimited Google Review Categories", availability: "included" },
      { label: "Lucky Draw", availability: "included" },
      { label: "Customer CRM", availability: "coming-soon" },
      { label: "AI Review Generator", availability: "coming-soon" },
      { label: "AI Social Caption Generator", availability: "coming-soon" },
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    priceLabel: "RM799/month",
    monthlyAiCredits: 300,
    branchLimit: 3,
    luckyDrawEnabled: true,
    features: [
      { label: "1 Business", availability: "included" },
      { label: "Up to 3 Branches", availability: "included" },
      { label: "300 Monthly AI Credits", availability: "included" },
      { label: "Unlimited QR Codes", availability: "included" },
      { label: "Unlimited Google Review Categories", availability: "included" },
      { label: "Lucky Draw", availability: "included" },
      { label: "Customer CRM", availability: "coming-soon" },
      { label: "AI Review Generator", availability: "coming-soon" },
      { label: "AI Social Caption Generator", availability: "coming-soon" },
    ],
  },
};

export const SUBSCRIPTION_PLAN_LIST = Object.values(SUBSCRIPTION_PLANS);

export function getSubscriptionPlan(id: SubscriptionPlanId): SubscriptionPlanDefinition {
  return SUBSCRIPTION_PLANS[id] ?? SUBSCRIPTION_PLANS.basic;
}
