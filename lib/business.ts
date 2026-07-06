import { getSubscriptionPlan, type SubscriptionPlanId } from "@/lib/subscription-plans";
import { hashPassword, verifyPassword } from "@/lib/password";

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
  /** Used to log in directly as this business's admin — see lib/auth.ts's login(). Never an email. */
  loginId: string;
  /** Always a "salt:hash" string — never the plaintext password. */
  passwordHash: string;
  /** True until this business's admin changes the default/reset password — enforced by MustChangePasswordGuard. */
  mustChangePassword: boolean;
};

/** The password every new or reset Business Admin account starts with, until they change it. */
export const DEFAULT_BUSINESS_PASSWORD = "12345";

/** Precomputed hash of DEFAULT_BUSINESS_PASSWORD, so seeding/migrating a business's default password never needs an async hash call. */
const DEFAULT_BUSINESS_PASSWORD_HASH =
  "premo-default-business-password:b12d0c824c1332da2ae65fc025d327c8d125ff2d4e1e3607562826e3d3aea872";

/** Keeps only what a login id is allowed to contain — lowercase letters and digits. */
function sanitizeLoginIdSegment(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** admin_ + the sanitized business id, deduplicated with a numeric suffix if that login id is already taken. */
function generateLoginId(businessId: string, existing: Business[]): string {
  const base = `admin_${sanitizeLoginIdSegment(businessId)}`;
  if (!existing.some((business) => business.loginId === base)) return base;

  let suffix = 2;
  while (existing.some((business) => business.loginId === `${base}${suffix}`)) {
    suffix += 1;
  }
  return `${base}${suffix}`;
}

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
  loginId: "admin_premo",
  passwordHash: DEFAULT_BUSINESS_PASSWORD_HASH,
  mustChangePassword: true,
};

/**
 * Fills in any missing fields on a stored business record — including the
 * brand-new loginId/passwordHash/mustChangePassword fields older records
 * were saved without. `siblings` is the already-normalized list processed
 * so far in this same pass, so a freshly-generated login id can never
 * collide with one just generated for an earlier business in the same
 * registry.
 */
function normalize(
  business: Partial<Business> & { id: string; name: string },
  siblings: Business[]
): Business {
  return {
    id: business.id,
    name: business.name,
    contactName: business.contactName ?? "",
    email: business.email ?? "",
    status: business.status ?? "active",
    createdAt: business.createdAt ?? new Date().toISOString(),
    subscription: normalizeSubscription(business.subscription),
    loginId: business.loginId ?? generateLoginId(business.id, siblings),
    passwordHash: business.passwordHash ?? DEFAULT_BUSINESS_PASSWORD_HASH,
    mustChangePassword: business.mustChangePassword ?? true,
  };
}

/**
 * Reads the full business registry from the Businesses API, normalizing
 * every entry exactly as the previous localStorage-backed readRegistry()
 * did. Falls back to [DEMO_BUSINESS] if the registry is empty or the
 * request fails, matching the old behavior. Any record missing the
 * loginId/passwordHash/mustChangePassword fields introduced for direct
 * Business Admin login gets backfilled here, once, and persisted — so
 * every client sees the exact same generated login id and default
 * password hash from then on, instead of silently recomputing it on every
 * read (which would let a duplicate-suffix login id drift between
 * requests, and is pointless work anyway since the hash is a fixed
 * constant for the shared default password).
 */
async function fetchRegistry(): Promise<Business[]> {
  try {
    const res = await fetch("/api/businesses");
    if (!res.ok) return [DEMO_BUSINESS];

    const parsed = (await res.json()) as Array<Partial<Business> & { id: string; name: string }>;
    if (parsed.length === 0) return [DEMO_BUSINESS];

    const normalized: Business[] = [];
    let needsPersist = false;
    for (const raw of parsed) {
      if (!raw.loginId || !raw.passwordHash) needsPersist = true;
      normalized.push(normalize(raw, normalized));
    }

    if (needsPersist) await writeRegistry(normalized);
    return normalized;
  } catch {
    return [DEMO_BUSINESS];
  }
}

async function writeRegistry(businesses: Business[]): Promise<void> {
  await fetch("/api/businesses", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(businesses),
  });
}

export async function listBusinesses(): Promise<Business[]> {
  return fetchRegistry();
}

export async function getBusinessById(id: string): Promise<Business | undefined> {
  return (await fetchRegistry()).find((business) => business.id === id);
}

export async function createBusiness(input: {
  id: string;
  name: string;
  contactName: string;
  email: string;
}): Promise<Business> {
  const registry = await fetchRegistry();
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
    loginId: generateLoginId(input.id, registry),
    passwordHash: DEFAULT_BUSINESS_PASSWORD_HASH,
    mustChangePassword: true,
  };

  await writeRegistry([...registry, business]);
  return business;
}

export async function updateBusiness(
  id: string,
  updates: Partial<
    Pick<Business, "name" | "contactName" | "email" | "status" | "passwordHash" | "mustChangePassword">
  >
): Promise<Business | undefined> {
  const registry = await fetchRegistry();
  let updated: Business | undefined;

  const next = registry.map((business) => {
    if (business.id !== id) return business;
    updated = { ...business, ...updates };
    return updated;
  });

  if (updated) await writeRegistry(next);
  return updated;
}

export async function setBusinessStatus(
  id: string,
  status: BusinessStatus
): Promise<Business | undefined> {
  return updateBusiness(id, { status });
}

/** Looks up a business by its Business Admin login id (see lib/auth.ts's login()). Never matches on email. */
export async function findBusinessByLoginId(loginId: string): Promise<Business | undefined> {
  const normalized = loginId.trim().toLowerCase();
  return (await fetchRegistry()).find(
    (business) => business.loginId.trim().toLowerCase() === normalized
  );
}

/** Verifies a plaintext password against this business's stored hash. Trims first, same reasoning as verifyAdminPassword in lib/admin.ts. */
export async function verifyBusinessPassword(
  business: Business,
  password: string
): Promise<boolean> {
  return verifyPassword(password.trim(), business.passwordHash);
}

/** Super Admin action: resets a business's password back to the shared default and forces a change on next login. */
export async function resetBusinessPassword(id: string): Promise<Business | undefined> {
  return updateBusiness(id, {
    passwordHash: DEFAULT_BUSINESS_PASSWORD_HASH,
    mustChangePassword: true,
  });
}

/** Business Admin action: changes their own password, verifying the current one first. */
export async function changeBusinessPassword(
  id: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const registry = await fetchRegistry();
  const business = registry.find((existing) => existing.id === id);
  if (!business) return { success: false, error: "Business account not found." };

  if (!(await verifyBusinessPassword(business, currentPassword))) {
    return { success: false, error: "Current password is incorrect." };
  }

  const trimmedNewPassword = newPassword.trim();
  if (!trimmedNewPassword || trimmedNewPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters." };
  }

  const hashed = await hashPassword(trimmedNewPassword);
  const next = registry.map((existing) =>
    existing.id === id
      ? { ...existing, passwordHash: hashed, mustChangePassword: false }
      : existing
  );
  await writeRegistry(next);
  return { success: true };
}

export async function updateBusinessSubscription(
  id: string,
  updates: Partial<Subscription>
): Promise<Business | undefined> {
  const registry = await fetchRegistry();
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

  if (updated) await writeRegistry(next);
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

export async function deleteBusiness(id: string): Promise<void> {
  const registry = await fetchRegistry();
  await writeRegistry(registry.filter((business) => business.id !== id));
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
