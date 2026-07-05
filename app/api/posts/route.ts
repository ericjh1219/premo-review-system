import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Post } from "@/lib/mock-data";

const DATA_DIR = path.join(process.cwd(), "data");
const BUSINESSES_DIR = path.join(DATA_DIR, "businesses");

/** Pre-migration single shared file (Record<businessId, Post[]>). Only ever read to seed a business's new per-business file if it has an entry there. */
const LEGACY_POSTS_FILE = path.join(DATA_DIR, "posts.json");

function businessDir(businessId: string) {
  return path.join(BUSINESSES_DIR, businessId);
}

function postsFile(businessId: string) {
  return path.join(businessDir(businessId), "posts.json");
}

async function writePostsFile(businessId: string, posts: Post[]): Promise<void> {
  await fs.mkdir(businessDir(businessId), { recursive: true });
  await fs.writeFile(postsFile(businessId), JSON.stringify(posts, null, 2), "utf-8");
}

async function readLegacyPosts(businessId: string): Promise<Post[] | null> {
  try {
    const raw = await fs.readFile(LEGACY_POSTS_FILE, "utf-8");
    const data = JSON.parse(raw) as Record<string, Post[]>;
    return data[businessId] ?? null;
  } catch {
    return null;
  }
}

/**
 * Reads a business's posts from its own data/businesses/<businessId>/posts.json.
 * If that file doesn't exist yet, it's created automatically: seeded from
 * that business's entry in the old pre-migration data/posts.json if present
 * (so data saved before per-business storage isn't lost), otherwise an empty
 * content library — there is no shared demo/seed data.
 */
async function readPostsFile(businessId: string): Promise<Post[]> {
  try {
    const raw = await fs.readFile(postsFile(businessId), "utf-8");
    return JSON.parse(raw) as Post[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      const seed = (await readLegacyPosts(businessId)) ?? [];
      await writePostsFile(businessId, seed);
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

  const posts = await readPostsFile(businessId);
  return NextResponse.json(posts);
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
      { success: false, error: "Posts data must be an array." },
      { status: 400 }
    );
  }

  await writePostsFile(businessId, body as Post[]);
  return NextResponse.json({ success: true });
}
