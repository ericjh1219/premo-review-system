import { getBusinessById, getCurrentBusinessId, setCurrentBusinessId } from "@/lib/business";
import {
  findAdminByEmail,
  getAdminById,
  recordAdminLogin,
  verifyAdminPassword,
  type AdminUser,
} from "@/lib/admin";

export type Session = {
  adminId: string;
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
 * The only real login system in this app: internal PREMO admins and staff.
 * Businesses don't sign in with their own credentials day-to-day — a Super
 * Admin instead uses "Login As Business" to enter a business's dashboard on
 * their behalf (see startImpersonation below), and customers only ever see
 * the public share page.
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  const admin = findAdminByEmail(email);
  if (!admin || !(await verifyAdminPassword(admin, password))) {
    return { success: false, error: "Incorrect email or password." };
  }
  if (admin.status === "inactive") {
    return { success: false, error: "This account has been deactivated." };
  }

  recordAdminLogin(admin.id);
  setSession({ adminId: admin.id });
  return { success: true };
}

/** Resolves the signed-in admin, or null if no session exists. */
export function getAuthenticatedAdmin(): AdminUser | null {
  const session = getSession();
  if (!session) return null;
  return getAdminById(session.adminId) ?? null;
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
export function getImpersonatedBusiness() {
  const session = getSession();
  if (!session?.impersonatingBusinessId) return null;
  return getBusinessById(session.impersonatingBusinessId) ?? null;
}

export function isImpersonating(): boolean {
  return Boolean(getSession()?.impersonatingBusinessId);
}
