import {
  findBusinessByLoginId,
  getBusinessById,
  getCurrentBusinessId,
  setCurrentBusinessId,
  verifyBusinessPassword,
  type Business,
} from "@/lib/business";
import {
  findAdminByLoginId,
  getAdminById,
  recordAdminLogin,
  verifyAdminPassword,
  type AdminUser,
} from "@/lib/admin";

export type Session = {
  /** Set for a Super Admin session (see /admin). Mutually exclusive with businessId. */
  adminId?: string;
  /** Set for a Business Admin session that logged in directly (see /app). */
  businessId?: string;
  /** Set while a Super Admin is "logged in as" a specific business (see Login As Business). */
  impersonatingBusinessId?: string;
};

const SESSION_KEY = "premo-session";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function setSession(session: Session) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function logout() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}

export type LoginResult = { success: true } | { success: false; error: string };

/**
 * Two kinds of accounts can sign in with a Login ID: the single Super Admin
 * (Login ID "admin", full platform access at /admin) and Business Admins
 * (one auto-generated Login ID per business, scoped to their own /app
 * dashboard). Login IDs are checked against Super Admins first, then
 * businesses, since a Login ID is unique within each list but the two lists
 * aren't cross-checked against each other.
 */
export async function login(loginId: string, password: string): Promise<LoginResult> {
  const admin = await findAdminByLoginId(loginId);
  if (admin) {
    if (!(await verifyAdminPassword(admin, password))) {
      return { success: false, error: "Incorrect Login ID or password." };
    }
    if (admin.status === "inactive") {
      return { success: false, error: "This account has been deactivated." };
    }

    await recordAdminLogin(admin.id);
    setSession({ adminId: admin.id });
    return { success: true };
  }

  const business = await findBusinessByLoginId(loginId);
  if (!business) {
    return { success: false, error: "Incorrect Login ID or password." };
  }

  if (!verifyBusinessPassword(business, password)) {
    return { success: false, error: "Incorrect Login ID or password." };
  }

  if (business.status === "inactive") {
    return { success: false, error: "This account has been deactivated." };
  }

  setCurrentBusinessId(business.id);
  setSession({ businessId: business.id });
  return { success: true };
}

/** Resolves the signed-in Super Admin, or null if no admin session exists. */
export async function getAuthenticatedAdmin(): Promise<AdminUser | null> {
  const session = getSession();
  if (!session?.adminId) return null;
  return (await getAdminById(session.adminId)) ?? null;
}

/** The business currently selected for viewing in the per-business tools (Dashboard, Posts, Profile). */
export function resolveBusinessId(): string {
  return getCurrentBusinessId();
}

/**
 * Starts "Login As Business": a Super Admin can temporarily enter a
 * business's /app dashboard without needing that business's password. The
 * banner shown in /app (see components/impersonation-banner.tsx) lets them
 * return to /admin with one click.
 */
export function startImpersonation(businessId: string) {
  const session = getSession();
  if (!session) return;

  setCurrentBusinessId(businessId);
  setSession({ ...session, impersonatingBusinessId: businessId });
}

export function stopImpersonation() {
  const session = getSession();
  if (!session) return;

  const { impersonatingBusinessId: _ignored, ...rest } = session;
  setSession(rest);
}

/** The business currently being impersonated, if any, resolved to its record. */
export async function getImpersonatedBusiness(): Promise<Business | null> {
  const session = getSession();
  if (!session?.impersonatingBusinessId) return null;
  return (await getBusinessById(session.impersonatingBusinessId)) ?? null;
}

export function isImpersonating(): boolean {
  return Boolean(getSession()?.impersonatingBusinessId);
}
