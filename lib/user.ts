import { DEMO_BUSINESS } from "@/lib/business";
import { hashPassword } from "@/lib/password";

export type UserRole = "Owner" | "Admin" | "Staff";
export type UserStatus = "active" | "inactive";

export type BusinessUser = {
  id: string;
  businessId: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  /**
   * Always a "salt:hash" string, or null if the Super Admin has never set
   * one for this business contact via Reset Password — never the plaintext
   * password.
   */
  password: string | null;
};

function storageKey(businessId: string) {
  return `premo-users:${businessId}`;
}

/**
 * Business contacts never log in — only internal PREMO admins/staff do (see
 * lib/admin.ts). This is just the demo business's default primary contact.
 */
const DEMO_OWNER: BusinessUser = {
  id: "user-premo-owner",
  businessId: DEMO_BUSINESS.id,
  name: DEMO_BUSINESS.contactName,
  email: DEMO_BUSINESS.email,
  role: "Owner",
  status: "active",
  lastLoginAt: null,
  createdAt: DEMO_BUSINESS.createdAt,
  password: null,
};

function seedFor(businessId: string): BusinessUser[] {
  return businessId === DEMO_BUSINESS.id ? [DEMO_OWNER] : [];
}

function readUsers(businessId: string): BusinessUser[] {
  if (typeof window === "undefined") return seedFor(businessId);

  try {
    const raw = window.localStorage.getItem(storageKey(businessId));
    if (raw) {
      const parsed = JSON.parse(raw) as BusinessUser[];
      return parsed.map((user) => ({ ...user, password: user.password ?? null }));
    }

    const seed = seedFor(businessId);
    writeUsers(businessId, seed);
    return seed;
  } catch {
    return seedFor(businessId);
  }
}

function writeUsers(businessId: string, users: BusinessUser[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(businessId), JSON.stringify(users));
}

function countOwners(users: BusinessUser[], excludingUserId?: string) {
  return users.filter((user) => user.role === "Owner" && user.id !== excludingUserId).length;
}

export function listUsers(businessId: string): BusinessUser[] {
  return readUsers(businessId);
}

export function getUserById(businessId: string, userId: string): BusinessUser | undefined {
  return readUsers(businessId).find((user) => user.id === userId);
}

/** Whether removing or demoting this user would leave the business with zero Owners. */
export function isLastOwner(businessId: string, userId: string): boolean {
  const users = readUsers(businessId);
  const user = users.find((existing) => existing.id === userId);
  return Boolean(user) && user!.role === "Owner" && countOwners(users, userId) === 0;
}

export function createUser(
  businessId: string,
  input: { name: string; email: string; role: UserRole }
): BusinessUser {
  const user: BusinessUser = {
    id: `user-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    businessId,
    name: input.name,
    email: input.email,
    role: input.role,
    status: "active",
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
    password: null,
  };

  writeUsers(businessId, [...readUsers(businessId), user]);
  return user;
}

/**
 * System Owner action: sets (or replaces) this business contact's password.
 * The password is hashed before storage and is never readable again — there
 * is no "view password" capability anywhere in this app.
 */
export async function resetUserPassword(
  businessId: string,
  userId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters." };
  }

  const users = readUsers(businessId);
  const target = users.find((user) => user.id === userId);
  if (!target) return { success: false, error: "User not found." };

  const hashed = await hashPassword(newPassword);
  writeUsers(
    businessId,
    users.map((user) => (user.id === userId ? { ...user, password: hashed } : user))
  );
  return { success: true };
}

export function updateUser(
  businessId: string,
  userId: string,
  updates: Partial<Pick<BusinessUser, "name" | "email" | "role" | "status">>
): { user?: BusinessUser; error?: string } {
  const users = readUsers(businessId);
  const target = users.find((user) => user.id === userId);
  if (!target) return { error: "User not found." };

  if (updates.role && updates.role !== "Owner" && isLastOwner(businessId, userId)) {
    return { error: "This business must have at least one Owner." };
  }

  const updated: BusinessUser = { ...target, ...updates };
  writeUsers(
    businessId,
    users.map((user) => (user.id === userId ? updated : user))
  );
  return { user: updated };
}

export function setUserStatus(
  businessId: string,
  userId: string,
  status: UserStatus
): { user?: BusinessUser; error?: string } {
  return updateUser(businessId, userId, { status });
}

export function deleteUser(
  businessId: string,
  userId: string
): { success: boolean; error?: string } {
  if (isLastOwner(businessId, userId)) {
    return { success: false, error: "Cannot delete the last Owner of a business." };
  }

  writeUsers(
    businessId,
    readUsers(businessId).filter((user) => user.id !== userId)
  );
  return { success: true };
}
