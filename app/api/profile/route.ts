import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { DEMO_BUSINESS } from "@/lib/business";
import { DEFAULT_PROFILE_DATA, type ProfileData } from "@/lib/profile-storage";

const DATA_DIR = path.join(process.cwd(), "data");
const BUSINESSES_DIR = path.join(DATA_DIR, "businesses");

/** Pre-migration single shared file. Only ever read once, to seed the demo business's new per-business file if it exists. */
const LEGACY_PROFILE_FILE = path.join(DATA_DIR, "profile.json");

/** Callers that don't pass businessId (not yet updated for multi-tenant storage) fall back to the demo business, matching the rest of the app's convention. */
const DEFAULT_BUSINESS_ID = DEMO_BUSINESS.id;

function businessDir(businessId: string) {
  return path.join(BUSINESSES_DIR, businessId);
}

function profileFile(businessId: string) {
  return path.join(businessDir(businessId), "profile.json");
}

async function writeProfileFile(businessId: string, data: ProfileData): Promise<void> {
  await fs.mkdir(businessDir(businessId), { recursive: true });
  await fs.writeFile(profileFile(businessId), JSON.stringify(data, null, 2), "utf-8");
}

async function readLegacyProfileFile(): Promise<ProfileData | null> {
  try {
    const raw = await fs.readFile(LEGACY_PROFILE_FILE, "utf-8");
    return JSON.parse(raw) as ProfileData;
  } catch {
    return null;
  }
}

/**
 * Reads a business's profile from its own data/businesses/<businessId>/profile.json.
 * If that file doesn't exist yet, it's created automatically: the demo
 * business seeds from the old pre-migration data/profile.json if present (so
 * data saved before per-business storage isn't lost), otherwise every
 * business starts from DEFAULT_PROFILE_DATA.
 */
async function readProfileFile(businessId: string): Promise<ProfileData> {
  try {
    const raw = await fs.readFile(profileFile(businessId), "utf-8");
    return JSON.parse(raw) as ProfileData;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      const legacy = businessId === DEFAULT_BUSINESS_ID ? await readLegacyProfileFile() : null;
      const seed = legacy ?? DEFAULT_PROFILE_DATA;
      await writeProfileFile(businessId, seed);
      return seed;
    }
    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId") ?? DEFAULT_BUSINESS_ID;

  const data = await readProfileFile(businessId);
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId") ?? DEFAULT_BUSINESS_ID;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { success: false, error: "Profile data must be a JSON object." },
      { status: 400 }
    );
  }

  await writeProfileFile(businessId, body as ProfileData);
  return NextResponse.json({ success: true });
}
