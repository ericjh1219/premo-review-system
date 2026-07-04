import { DEMO_BUSINESS } from "@/lib/business";

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
};

function storageKey(businessId: string) {
  return `premo-users:${businessId}`;
}

const DEMO_OWNER: BusinessUser = {
  id: "user-premo-owner",
  businessId: DEMO_BUSINESS.id,
  name: DEMO_BUSINESS.contactName,
  email: DEMO_BUSINESS.email,
  role: "Owner",
  status: "active",
  lastLoginAt: null,
  createdAt: DEMO_BUSINESS.createdAt,
};

function seedFor(businessId: string): BusinessUser[] {
  return businessId === DEMO_BUSINESS.id ? [DEMO_OWNER] : [];
}

function readUsers(businessId: string): BusinessUser[] {
  if (typeof window === "undefined") return seedFor(businessId);

  try {
    const raw = window.localStorage.getItem(storageKey(businessId));
    if (raw) return JSON.parse(raw) as BusinessUser[];

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
  };

  writeUsers(businessId, [...readUsers(businessId), user]);
  return user;
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
