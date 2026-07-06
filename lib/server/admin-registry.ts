import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_ADMIN, type AdminUser } from "@/lib/admin";

const DATA_DIR = path.join(process.cwd(), "data");
const ADMINS_FILE = path.join(DATA_DIR, "admins.json");

export async function writeAdminsFile(admins: AdminUser[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ADMINS_FILE, JSON.stringify(admins, null, 2), "utf-8");
}

/**
 * Reads the full admin/staff registry directly from disk — the single
 * shared source of truth for Super Admin and Staff accounts, same as
 * business-registry.ts is for businesses. Every browser and device now sees
 * the same accounts, unlike the old localStorage-per-browser model.
 */
export async function readAdminsFile(): Promise<AdminUser[]> {
  try {
    const raw = await fs.readFile(ADMINS_FILE, "utf-8");
    return JSON.parse(raw) as AdminUser[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      const seed = [DEFAULT_ADMIN];
      await writeAdminsFile(seed);
      return seed;
    }
    throw error;
  }
}
