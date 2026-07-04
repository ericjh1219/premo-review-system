import { getSubscriptionPlan, type SubscriptionPlanId } from "@/lib/subscription-plans";

export type BusinessStatus = "active" | "inactive";

export type SubscriptionPlan = SubscriptionPlanId;
export type SubscriptionStatus = "active" | "expired" | "suspended" | "trial";

export type Subscription = {
  plan: SubscriptionPlanId;
  status: SubscriptionStatus;
  startDate: string;
  expiryDate: string;
  /** Generic AI credit pool — every future AI feature (reviews, captions, replies, translations, etc.) draws from this same balance. */
  monthlyAiCredits: number;
  remainingAiCredits: number;
  branchLimit: number;
  luckyDrawEnabled: boolean;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Business = {
  id: string;
  name: string;
  contactName: string;
  email: string;
  status: BusinessStatus;
  createdAt: string;
  subscription: Subscription;
};

const REGISTRY_KEY = "premo-businesses";
const CURRENT_BUSINESS_KEY = "premo-current-business-id";

function defaultSubscription(): Subscription {
  const plan = getSubscriptionPlan("basic");
  const start = new Date();
  const expiry = new Date(start);
  expiry.setDate(expiry.getDate() + 30);
  const now = start.toISOString();

  return {
    plan: plan.id,
    status: "trial",
    startDate: now,
    expiryDate: expiry.toISOString(),
    monthlyAiCredits: plan.monthlyAiCredits,
    remainingAiCredits: plan.monthlyAiCredits,
    branchLimit: plan.branchLimit,
    luckyDrawEnabled: plan.luckyDrawEnabled,
    autoRenew: false,
    createdAt: now,
    updatedAt: now,
  };
}

/** Maps legacy plan values (from before the Basic/Pro/Enterprise catalog existed) onto the current plan ids. */
function normalizePlanId(plan: unknown): SubscriptionPlanId {
  if (plan === "basic" || plan === "pro" || plan === "enterprise") return plan;
  if (plan === "Free" || plan === "Starter") return "basic";
  if (plan === "Pro") return "pro";
  if (plan === "Enterprise") return "enterprise";
  return "basic";
}

function normalizeSubscription(subscription: Partial<Subscription> | undefined): Subscription {
  const fallback = defaultSubscription();
  if (!subscription) return fallback;

  const plan = normalizePlanId(subscription.plan);
  const planDefaults = getSubscriptionPlan(plan);

  return {
    plan,
    status: subscription.status ?? fallback.status,
    startDate: subscription.startDate ?? fallback.startDate,
    expiryDate: subscription.expiryDate ?? fallback.expiryDate,
    monthlyAiCredits: subscription.monthlyAiCredits ?? planDefaults.monthlyAiCredits,
    remainingAiCredits: subscription.remainingAiCredits ?? planDefaults.monthlyAiCredits,
    branchLimit: subscription.branchLimit ?? planDefaults.branchLimit,
    luckyDrawEnabled: subscription.luckyDrawEnabled ?? planDefaults.luckyDrawEnabled,
    autoRenew: subscription.autoRenew ?? false,
    createdAt: subscription.createdAt ?? fallback.createdAt,
    updatedAt: subscription.updatedAt ?? fallback.createdAt,
  };
}

/**
 * The single pre-existing business this project was built around. Every
 * business-scoped storage module falls back to this id so the current demo
 * keeps working exactly as before while the rest of the app becomes
 * multi-tenant.
 */
export const DEMO_BUSINESS: Business = {
  id: "premo-studio",
  name: "PREMO Studio",
  contactName: "Premo Admin",
  email: "contact@premostudio.com",
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  subscription: {
    plan: "pro",
    status: "active",
    startDate: "2026-01-01T00:00:00.000Z",
    expiryDate: "2027-01-01T00:00:00.000Z",
    monthlyAiCredits: 120,
    remainingAiCredits: 120,
    branchLimit: 1,
    luckyDrawEnabled: true,
    autoRenew: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
};

function normalize(business: Partial<Business> & { id: string; name: string }): Business {
  return {
    id: business.id,
    name: business.name,
    contactName: business.contactName ?? "",
    email: business.email ?? "",
    status: business.status ?? "active",
    createdAt: business.createdAt ?? new Date().toISOString(),
    subscription: normalizeSubscription(business.subscription),
  };
}

function readRegistry(): Business[] {
  if (typeof window === "undefined") return [DEMO_BUSINESS];

  try {
    const raw = window.localStorage.getItem(REGISTRY_KEY);
    if (!raw) return [DEMO_BUSINESS];

    const parsed = JSON.parse(raw) as Business[];
    return parsed.length > 0 ? parsed.map(normalize) : [DEMO_BUSINESS];
  } catch {
    return [DEMO_BUSINESS];
  }
}

function writeRegistry(businesses: Business[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REGISTRY_KEY, JSON.stringify(businesses));
}

export function listBusinesses(): Business[] {
  return readRegistry();
}

export function getBusinessById(id: string): Business | undefined {
  return readRegistry().find((business) => business.id === id);
}

export function createBusiness(input: {
  id: string;
  name: string;
  contactName: string;
  email: string;
}): Business {
  const registry = readRegistry();
  if (registry.some((existing) => existing.id === input.id)) {
    throw new Error(`A business with id "${input.id}" already exists.`);
  }

  const business: Business = {
    id: input.id,
    name: input.name,
    contactName: input.contactName,
    email: input.email,
    status: "active",
    createdAt: new Date().toISOString(),
    subscription: defaultSubscription(),
  };

  writeRegistry([...registry, business]);
  return business;
}

export function updateBusiness(
  id: string,
  updates: Partial<Pick<Business, "name" | "contactName" | "email" | "status">>
): Business | undefined {
  const registry = readRegistry();
  let updated: Business | undefined;

  const next = registry.map((business) => {
    if (business.id !== id) return business;
    updated = { ...business, ...updates };
    return updated;
  });

  if (updated) writeRegistry(next);
  return updated;
}

export function setBusinessStatus(id: string, status: BusinessStatus): Business | undefined {
  return updateBusiness(id, { status });
}

export function updateBusinessSubscription(
  id: string,
  updates: Partial<Subscription>
): Business | undefined {
  const registry = readRegistry();
  let updated: Business | undefined;

  const next = registry.map((business) => {
    if (business.id !== id) return business;
    updated = {
      ...business,
      subscription: {
        ...business.subscription,
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    };
    return updated;
  });

  if (updated) writeRegistry(next);
  return updated;
}

/**
 * The subscription status that actually governs access, factoring in the
 * expiry date even if an admin forgot to flip the status field by hand.
 * "suspended" always wins (an explicit admin action), otherwise a business
 * whose expiry date has passed is treated as expired regardless of the
 * stored status.
 */
export function getEffectiveSubscriptionStatus(business: Business): SubscriptionStatus {
  if (business.subscription.status === "suspended") return "suspended";
  if (new Date(business.subscription.expiryDate).getTime() < Date.now()) return "expired";
  return business.subscription.status;
}

export function deleteBusiness(id: string) {
  writeRegistry(readRegistry().filter((business) => business.id !== id));
}

/**
 * Fallback used by lib/auth.ts's resolveBusinessId() when no session exists
 * yet (e.g. a page rendering before the auth guard redirects). Defaults to
 * the demo business.
 */
export function getCurrentBusinessId(): string {
  if (typeof window === "undefined") return DEMO_BUSINESS.id;
  return window.localStorage.getItem(CURRENT_BUSINESS_KEY) ?? DEMO_BUSINESS.id;
}

export function setCurrentBusinessId(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CURRENT_BUSINESS_KEY, id);
}
