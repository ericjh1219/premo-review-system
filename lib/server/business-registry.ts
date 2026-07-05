import { promises as fs } from "fs";
import path from "path";
import { DEMO_BUSINESS, type Business } from "@/lib/business";

const DATA_DIR = path.join(process.cwd(), "data");
const BUSINESSES_FILE = path.join(DATA_DIR, "businesses.json");

export async function writeBusinessesFile(businesses: Business[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(BUSINESSES_FILE, JSON.stringify(businesses, null, 2), "utf-8");
}

/**
 * Reads the full business registry directly from disk. Shared by the
 * Businesses API route and any Server Component that needs to look up a
 * business without a client-side HTTP round-trip — e.g. the public Share
 * Page's existence check, which must run server-side to return a real 404
 * status for an unknown slug instead of shipping a 200 page first and
 * deciding client-side.
 */
export async function readBusinessesFile(): Promise<Business[]> {
  try {
    const raw = await fs.readFile(BUSINESSES_FILE, "utf-8");
    return JSON.parse(raw) as Business[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      const seed = [DEMO_BUSINESS];
      await writeBusinessesFile(seed);
      return seed;
    }
    throw error;
  }
}

/** Whether a business with this id exists in the registry. */
export async function businessExists(businessId: string): Promise<boolean> {
  const businesses = await readBusinessesFile();
  return businesses.some((business) => business.id === businessId);
}
