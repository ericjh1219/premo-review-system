import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { DEMO_BUSINESS, type Business } from "@/lib/business";

const DATA_DIR = path.join(process.cwd(), "data");
const BUSINESSES_FILE = path.join(DATA_DIR, "businesses.json");

async function writeBusinessesFile(businesses: Business[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(BUSINESSES_FILE, JSON.stringify(businesses, null, 2), "utf-8");
}

/**
 * Reads the full business registry from data/businesses.json. If the file
 * doesn't exist yet, it's created automatically seeded with the demo
 * business, matching the previous localStorage registry's behavior of
 * falling back to [DEMO_BUSINESS] when empty.
 */
async function readBusinessesFile(): Promise<Business[]> {
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

export async function GET() {
  const businesses = await readBusinessesFile();
  return NextResponse.json(businesses);
}

export async function PUT(request: Request) {
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
      { success: false, error: "Businesses data must be an array." },
      { status: 400 }
    );
  }

  await writeBusinessesFile(body as Business[]);
  return NextResponse.json({ success: true });
}
