export type AdminRole = "Admin" | "Staff";
export type AdminStatus = "active" | "inactive";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
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
 * admins are created.
 */
const DEFAULT_ADMIN: AdminUser = {
  id: "admin-premo-default",
  name: "Premo Admin",
  email: "contact@premostudio.com",
  password: "premo123",
  role: "Admin",
  status: "active",
  lastLoginAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
};

function readAdmins(): AdminUser[] {
  if (typeof window === "undefined") return [DEFAULT_ADMIN];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AdminUser[];

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

function countAdminsWithRole(admins: AdminUser[], excludingId?: string) {
  return admins.filter((admin) => admin.role === "Admin" && admin.id !== excludingId).length;
}

/** Whether removing or demoting this account would leave the platform with zero Admins. */
export function isLastAdmin(id: string): boolean {
  const admins = readAdmins();
  const admin = admins.find((existing) => existing.id === id);
  return Boolean(admin) && admin!.role === "Admin" && countAdminsWithRole(admins, id) === 0;
}

export function createAdmin(input: {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}): AdminUser {
  const admin: AdminUser = {
    id: `admin-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role,
    status: "active",
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
  };

  writeAdmins([...readAdmins(), admin]);
  return admin;
}

export function updateAdmin(
  id: string,
  updates: Partial<Pick<AdminUser, "name" | "email" | "role" | "status" | "password">>
): { admin?: AdminUser; error?: string } {
  const admins = readAdmins();
  const target = admins.find((admin) => admin.id === id);
  if (!target) return { error: "Admin account not found." };

  if (updates.role && updates.role !== "Admin" && isLastAdmin(id)) {
    return { error: "The platform must have at least one Admin." };
  }

  const updated: AdminUser = { ...target, ...updates };
  writeAdmins(admins.map((admin) => (admin.id === id ? updated : admin)));
  return { admin: updated };
}

export function setAdminStatus(
  id: string,
  status: AdminStatus
): { admin?: AdminUser; error?: string } {
  return updateAdmin(id, { status });
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

export function changePassword(
  id: string,
  currentPassword: string,
  newPassword: string
): { success: boolean; error?: string } {
  const admins = readAdmins();
  const admin = admins.find((existing) => existing.id === id);
  if (!admin) return { success: false, error: "Admin account not found." };

  if (admin.password !== currentPassword) {
    return { success: false, error: "Current password is incorrect." };
  }
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters." };
  }

  writeAdmins(
    admins.map((existing) => (existing.id === id ? { ...existing, password: newPassword } : existing))
  );
  return { success: true };
}
