import { hashPassword, isHashedPassword, verifyPassword } from "@/lib/password";

export type AdminRole = "Admin" | "Staff";
export type AdminStatus = "active" | "inactive";

export type AdminUser = {
  id: string;
  name: string;
  /** No longer used for login — kept only for notifications/reference. See loginId. */
  email: string;
  /** Used to log in — see lib/auth.ts's login(). The seed Super Admin's is literally "admin". */
  loginId: string;
  /** Always a "salt:hash" string — never the plaintext password. */
  password: string;
  role: AdminRole;
  status: AdminStatus;
  lastLoginAt: string | null;
  createdAt: string;
};

/**
 * The one internal PREMO account this system ships with. There is no signup
 * flow, so this is the account used to log into the dashboard until more
 * admins are created. Pre-hashed so no plaintext password ever appears in
 * this codebase. Used to seed data/admins.json (see lib/server/admin-registry.ts)
 * the first time the server starts with no existing admin file.
 */
export const DEFAULT_ADMIN: AdminUser = {
  id: "admin-premo-default",
  name: "PREMO Studio",
  email: "admin@review.premostudio.my",
  loginId: "admin",
  password: "premo-launch-salt-admin:f8179a76946ff02fab0fb779a677c3741ef4da5b5fa6e616340792ecfc9a8c8e",
  role: "Admin",
  status: "active",
  lastLoginAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

/**
 * The exact seed values DEFAULT_ADMIN used to have, before its email/password
 * were rotated for launch. Matching on the *exact* old email+hash (not just
 * "differs from current") means this can only ever catch that stale seed —
 * never an admin's own deliberate password change, which would produce a
 * different hash.
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
  return admins.map((admin) => (isStaleSeed(admin) ? DEFAULT_ADMIN : admin));
}

/**
 * Backfills loginId for admin records saved before Login IDs replaced email
 * as the login credential. The default Super Admin always gets "admin"; any
 * other pre-existing record gets a sanitized-name fallback, de-duplicated
 * against its siblings the same way business Login IDs are.
 */
function migrateMissingLoginIds(admins: AdminUser[]): AdminUser[] {
  if (admins.every((admin) => admin.loginId)) return admins;

  const migrated: AdminUser[] = [];
  for (const admin of admins) {
    if (admin.loginId) {
      migrated.push(admin);
      continue;
    }

    const base =
      admin.id === DEFAULT_ADMIN.id
        ? "admin"
        : admin.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "") || "staff";
    let candidate = base;
    let suffix = 2;
    while (migrated.some((existing) => existing.loginId === candidate)) {
      candidate = `${base}${suffix}`;
      suffix += 1;
    }
    migrated.push({ ...admin, loginId: candidate });
  }

  return migrated;
}

/**
 * Reads the full admin/staff registry from the Admins API, the single
 * shared source of truth for every browser and device (mirrors
 * lib/business.ts's fetchRegistry()). Falls back to [DEFAULT_ADMIN] if the
 * registry is empty or the request fails. Any record missing a loginId, or
 * still carrying the stale pre-launch seed, gets migrated here once and
 * persisted — so every client sees the same corrected record from then on.
 */
async function fetchAdmins(): Promise<AdminUser[]> {
  try {
    const res = await fetch("/api/admins");
    if (!res.ok) return [DEFAULT_ADMIN];

    const parsed = (await res.json()) as AdminUser[];
    if (parsed.length === 0) return [DEFAULT_ADMIN];

    const migrated = migrateMissingLoginIds(migrateStaleDefaultAdmin(parsed));
    if (migrated !== parsed) await writeAdmins(migrated);
    return migrated;
  } catch {
    return [DEFAULT_ADMIN];
  }
}

async function writeAdmins(admins: AdminUser[]): Promise<void> {
  await fetch("/api/admins", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(admins),
  });
}

export async function listAdmins(): Promise<AdminUser[]> {
  return fetchAdmins();
}

export async function getAdminById(id: string): Promise<AdminUser | undefined> {
  return (await fetchAdmins()).find((admin) => admin.id === id);
}

export async function findAdminByLoginId(loginId: string): Promise<AdminUser | undefined> {
  const normalized = loginId.trim().toLowerCase();
  return (await fetchAdmins()).find((admin) => admin.loginId.trim().toLowerCase() === normalized);
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
 * Some records may still carry a plaintext password from before hashing was
 * introduced. If so, and the plaintext matches, transparently upgrade the
 * stored record to a proper hash so it never sits around in plaintext.
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
  const admins = await fetchAdmins();
  const hashed = await hashPassword(password);
  await writeAdmins(admins.map((admin) => (admin.id === id ? { ...admin, password: hashed } : admin)));
}

/** Whether removing or demoting this account would leave the platform with zero Admins. */
export function isLastAdmin(admins: AdminUser[], id: string): boolean {
  const admin = admins.find((existing) => existing.id === id);
  if (!admin || admin.role !== "Admin") return false;
  return admins.filter((existing) => existing.role === "Admin" && existing.id !== id).length === 0;
}

export async function createAdmin(input: {
  name: string;
  email: string;
  loginId: string;
  password: string;
  role: AdminRole;
}): Promise<{ admin?: AdminUser; error?: string }> {
  const admins = await fetchAdmins();
  const normalizedLoginId = input.loginId.trim().toLowerCase();
  if (admins.some((admin) => admin.loginId.trim().toLowerCase() === normalizedLoginId)) {
    return { error: "That Login ID is already in use." };
  }

  const admin: AdminUser = {
    id: `admin-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: input.name,
    email: input.email,
    loginId: normalizedLoginId,
    password: await hashPassword(input.password.trim()),
    role: input.role,
    status: "active",
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
  };

  await writeAdmins([...admins, admin]);
  return { admin };
}

export async function updateAdmin(
  id: string,
  updates: Partial<Pick<AdminUser, "name" | "email" | "loginId" | "role" | "status">> & {
    password?: string;
  }
): Promise<{ admin?: AdminUser; error?: string }> {
  const admins = await fetchAdmins();
  const target = admins.find((admin) => admin.id === id);
  if (!target) return { error: "Admin account not found." };

  if (updates.role && updates.role !== "Admin" && isLastAdmin(admins, id)) {
    return { error: "The platform must have at least one Admin." };
  }

  if (updates.loginId) {
    const normalizedLoginId = updates.loginId.trim().toLowerCase();
    if (admins.some((admin) => admin.id !== id && admin.loginId.trim().toLowerCase() === normalizedLoginId)) {
      return { error: "That Login ID is already in use." };
    }
    updates = { ...updates, loginId: normalizedLoginId };
  }

  const { password, ...rest } = updates;
  const updated: AdminUser = {
    ...target,
    ...rest,
    ...(password ? { password: await hashPassword(password.trim()) } : {}),
  };
  await writeAdmins(admins.map((admin) => (admin.id === id ? updated : admin)));
  return { admin: updated };
}

export async function setAdminStatus(
  id: string,
  status: AdminStatus
): Promise<{ admin?: AdminUser; error?: string }> {
  const admins = await fetchAdmins();
  const target = admins.find((admin) => admin.id === id);
  if (!target) return { error: "Admin account not found." };

  const updated: AdminUser = { ...target, status };
  await writeAdmins(admins.map((admin) => (admin.id === id ? updated : admin)));
  return { admin: updated };
}

export async function deleteAdmin(id: string): Promise<{ success: boolean; error?: string }> {
  const admins = await fetchAdmins();
  if (isLastAdmin(admins, id)) {
    return { success: false, error: "Cannot delete the last Admin on the platform." };
  }

  await writeAdmins(admins.filter((admin) => admin.id !== id));
  return { success: true };
}

export async function recordAdminLogin(id: string): Promise<void> {
  const admins = await fetchAdmins();
  await writeAdmins(
    admins.map((admin) =>
      admin.id === id ? { ...admin, lastLoginAt: new Date().toISOString() } : admin
    )
  );
}

/** Changes an admin's own password — updates the shared server record, visible to every browser and device. */
export async function changePassword(
  id: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const admins = await fetchAdmins();
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
  await writeAdmins(
    admins.map((existing) => (existing.id === id ? { ...existing, password: hashed } : existing))
  );
  return { success: true };
}
