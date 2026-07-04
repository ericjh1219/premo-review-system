import { getCurrentBusinessId } from "@/lib/business";
import { findAdminByEmail, getAdminById, recordAdminLogin, type AdminUser } from "@/lib/admin";

export type Session = {
  adminId: string;
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
 * The only authentication system in this app: internal PREMO admins and
 * staff. Businesses and customers never log in — businesses are managed by
 * admins from the Businesses page, and customers only ever see the public
 * share page.
 */
export function login(email: string, password: string): LoginResult {
  const admin = findAdminByEmail(email);
  if (!admin || admin.password !== password) {
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
