import { hashPassword, isHashedPassword, verifyPassword } from "@/lib/password";

export type AdminRole = "Admin" | "Staff";
export type AdminStatus = "active" | "inactive";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  /** Always a "salt:hash" string — never the plaintext password. */
  password: string;
  role: AdminRole;
  status: AdminStatus;
  lastLoginAt: string | null;
  createdAt: string;
};

const STORAGE_KEY = "premo-admins";

/**
 * The one internal PREMO account this system ships with. There is no signup
 * flow, so this is the account used to log into the dashboard until more
 * admins are created (and until a proper Account Settings module lets this
 * admin change their own email/password post-launch). Pre-hashed so no
 * plaintext password ever appears in this codebase.
 */
const DEFAULT_ADMIN: AdminUser = {
  id: "admin-premo-default",
  name: "PREMO Studio",
  email: "admin@review.premostudio.my",
  password: "premo-launch-salt-admin:f8179a76946ff02fab0fb779a677c3741ef4da5b5fa6e616340792ecfc9a8c8e",
  role: "Admin",
  status: "active",
  lastLoginAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

/**
 * The exact seed values DEFAULT_ADMIN used to have, before its email/password
 * were rotated for launch. Auth has no server/database — every browser seeds
 * its own copy of DEFAULT_ADMIN into localStorage the first time it loads
 * the app, so a device that had already visited before the rotation is stuck
 * with this old record forever unless it's migrated forward here. Matching
 * on the *exact* old email+hash (not just "differs from current") means this
 * can only ever catch that stale seed — never an admin's own deliberate
 * password change, which would produce a different hash.
 */
const PRE_LAUNCH_SEED_ADMIN: Pick<AdminUser, "email" | "password"> = {
  email: "contact@premostudio.com",
  password: "demo-seed-salt-admin:36c0773433130c17aec3de67c72b647ab715b0bfa0705d61ba39061668d4fd54",
};

function migrateStaleDefaultAdmin(admins: AdminUser[]): AdminUser[] {
  const isStaleSeed = (admin: AdminUser) =>
    admin.id === DEFAULT_ADMIN.id &&
    admin.email === PRE_LAUNCH_SEED_ADMIN.email &&
    admin.password === PRE_LAUNCH_SEED_ADMIN.password;

  if (!admins.some(isStaleSeed)) return admins;

  const migrated = admins.map((admin) => (isStaleSeed(admin) ? DEFAULT_ADMIN : admin));
  writeAdmins(migrated);
  return migrated;
}

function readAdmins(): AdminUser[] {
  if (typeof window === "undefined") return [DEFAULT_ADMIN];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return migrateStaleDefaultAdmin(JSON.parse(raw) as AdminUser[]);

    writeAdmins([DEFAULT_ADMIN]);
    return [DEFAULT_ADMIN];
  } catch {
    return [DEFAULT_ADMIN];
  }
}

function writeAdmins(admins: AdminUser[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(admins));
}

export function listAdmins(): AdminUser[] {
  return readAdmins();
}

export function getAdminById(id: string): AdminUser | undefined {
  return readAdmins().find((admin) => admin.id === id);
}

export function findAdminByEmail(email: string): AdminUser | undefined {
  const normalized = email.trim().toLowerCase();
  return readAdmins().find((admin) => admin.email.trim().toLowerCase() === normalized);
}

/**
 * Verifies a plaintext password against this admin's stored hash.
 *
 * Trims the input first: a password typed by hand never has leading/
 * trailing whitespace, but one delivered via clipboard paste sometimes
 * does (copying from Notes, Messages, or a password manager can carry a
 * trailing newline or space depending on the source and the browser
 * engine's paste handling) — an exact-match hash comparison would silently
 * reject an otherwise-correct password in that case. hashPassword() at
 * account-creation/change time trims the same way, so a trimmed password
 * is always what actually got hashed.
 *
 * Some browsers may still have an admin record seeded before password
 * hashing was introduced (a plaintext password string). If so, and the
 * plaintext matches, transparently upgrade the stored record to a proper
 * hash so it never sits around in plaintext after a successful login.
 */
export async function verifyAdminPassword(admin: AdminUser, password: string): Promise<boolean> {
  const trimmedPassword = password.trim();

  if (!isHashedPassword(admin.password)) {
    if (admin.password !== trimmedPassword) return false;
    await migrateLegacyPassword(admin.id, trimmedPassword);
    return true;
  }
  return verifyPassword(trimmedPassword, admin.password);
}

async function migrateLegacyPassword(id: string, password: string) {
  const admins = readAdmins();
  const hashed = await hashPassword(password);
  writeAdmins(admins.map((admin) => (admin.id === id ? { ...admin, password: hashed } : admin)));
}

function countAdminsWithRole(admins: AdminUser[], excludingId?: string) {
  return admins.filter((admin) => admin.role === "Admin" && admin.id !== excludingId).length;
}

/** Whether removing or demoting this account would leave the platform with zero Admins. */
export function isLastAdmin(id: string): boolean {
  const admins = readAdmins();
  const admin = admins.find((existing) => existing.id === id);
  return Boolean(admin) && admin!.role === "Admin" && countAdminsWithRole(admins, id) === 0;
}

export async function createAdmin(input: {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}): Promise<AdminUser> {
  const admin: AdminUser = {
    id: `admin-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: input.name,
    email: input.email,
    password: await hashPassword(input.password.trim()),
    role: input.role,
    status: "active",
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
  };

  writeAdmins([...readAdmins(), admin]);
  return admin;
}

export async function updateAdmin(
  id: string,
  updates: Partial<Pick<AdminUser, "name" | "email" | "role" | "status">> & { password?: string }
): Promise<{ admin?: AdminUser; error?: string }> {
  const admins = readAdmins();
  const target = admins.find((admin) => admin.id === id);
  if (!target) return { error: "Admin account not found." };

  if (updates.role && updates.role !== "Admin" && isLastAdmin(id)) {
    return { error: "The platform must have at least one Admin." };
  }

  const { password, ...rest } = updates;
  const updated: AdminUser = {
    ...target,
    ...rest,
    ...(password ? { password: await hashPassword(password.trim()) } : {}),
  };
  writeAdmins(admins.map((admin) => (admin.id === id ? updated : admin)));
  return { admin: updated };
}

export function setAdminStatus(
  id: string,
  status: AdminStatus
): { admin?: AdminUser; error?: string } {
  const admins = readAdmins();
  const target = admins.find((admin) => admin.id === id);
  if (!target) return { error: "Admin account not found." };

  const updated: AdminUser = { ...target, status };
  writeAdmins(admins.map((admin) => (admin.id === id ? updated : admin)));
  return { admin: updated };
}

export function deleteAdmin(id: string): { success: boolean; error?: string } {
  if (isLastAdmin(id)) {
    return { success: false, error: "Cannot delete the last Admin on the platform." };
  }

  writeAdmins(readAdmins().filter((admin) => admin.id !== id));
  return { success: true };
}

export function recordAdminLogin(id: string): void {
  const admins = readAdmins();
  writeAdmins(
    admins.map((admin) =>
      admin.id === id ? { ...admin, lastLoginAt: new Date().toISOString() } : admin
    )
  );
}

export async function changePassword(
  id: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const admins = readAdmins();
  const admin = admins.find((existing) => existing.id === id);
  if (!admin) return { success: false, error: "Admin account not found." };

  if (!(await verifyPassword(currentPassword.trim(), admin.password))) {
    return { success: false, error: "Current password is incorrect." };
  }
  const trimmedNewPassword = newPassword.trim();
  if (!trimmedNewPassword || trimmedNewPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters." };
  }

  const hashed = await hashPassword(trimmedNewPassword);
  writeAdmins(
    admins.map((existing) => (existing.id === id ? { ...existing, password: hashed } : existing))
  );
  return { success: true };
}
