import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { GoogleReviewCategory } from "@/lib/review-categories";

const DATA_DIR = path.join(process.cwd(), "data");
const BUSINESSES_DIR = path.join(DATA_DIR, "businesses");

/** Pre-migration single shared file (Record<businessId, GoogleReviewCategory[]>). Only ever read to seed a business's new per-business file if it has an entry there. */
const LEGACY_CATEGORIES_FILE = path.join(DATA_DIR, "review-categories.json");

function businessDir(businessId: string) {
  return path.join(BUSINESSES_DIR, businessId);
}

function categoriesFile(businessId: string) {
  return path.join(businessDir(businessId), "review-categories.json");
}

async function writeCategoriesFile(
  businessId: string,
  categories: GoogleReviewCategory[]
): Promise<void> {
  await fs.mkdir(businessDir(businessId), { recursive: true });
  await fs.writeFile(categoriesFile(businessId), JSON.stringify(categories, null, 2), "utf-8");
}

async function readLegacyCategories(businessId: string): Promise<GoogleReviewCategory[] | null> {
  try {
    const raw = await fs.readFile(LEGACY_CATEGORIES_FILE, "utf-8");
    const data = JSON.parse(raw) as Record<string, GoogleReviewCategory[]>;
    return data[businessId] ?? null;
  } catch {
    return null;
  }
}

/**
 * Reads a business's Google Review Categories from its own
 * data/businesses/<businessId>/review-categories.json. If that file doesn't
 * exist yet, it's created automatically: seeded from that business's entry
 * in the old pre-migration data/review-categories.json if present (so data
 * saved before per-business storage isn't lost), otherwise no categories —
 * there is no shared demo/seed data.
 */
async function readCategoriesFile(businessId: string): Promise<GoogleReviewCategory[]> {
  try {
    const raw = await fs.readFile(categoriesFile(businessId), "utf-8");
    return JSON.parse(raw) as GoogleReviewCategory[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      const seed = (await readLegacyCategories(businessId)) ?? [];
      await writeCategoriesFile(businessId, seed);
      return seed;
    }
    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return NextResponse.json(
      { success: false, error: "Missing businessId query parameter." },
      { status: 400 }
    );
  }

  try {
    const categories = await readCategoriesFile(businessId);
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to load categories." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return NextResponse.json(
      { success: false, error: "Missing businessId query parameter." },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  if (!Array.isArray(body)) {
    return NextResponse.json(
      { success: false, error: "Categories data must be an array." },
      { status: 400 }
    );
  }

  try {
    await writeCategoriesFile(businessId, body as GoogleReviewCategory[]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to save categories." },
      { status: 500 }
    );
  }
}
