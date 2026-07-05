import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { CONTENT_TYPE_BY_EXTENSION, isSafeUploadFilename, UPLOAD_DIR } from "@/lib/server/upload-storage";

// Route Handlers default to the Node.js runtime, but this is pinned
// explicitly because "fs" is unavailable on the Edge runtime.
export const runtime = "nodejs";

/**
 * Serves an uploaded file from the exact same directory the upload route
 * writes to, using the exact same path.join(process.cwd(), ...) resolution
 * — so read and write can never disagree about where "public/uploads"
 * actually is, regardless of how the server process was launched.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (!isSafeUploadFilename(filename)) {
    return NextResponse.json({ success: false, error: "Invalid filename." }, { status: 400 });
  }

  try {
    const buffer = await fs.readFile(path.join(UPLOAD_DIR, filename));
    const contentType = CONTENT_TYPE_BY_EXTENSION[path.extname(filename)] ?? "application/octet-stream";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        // Filenames are random UUIDs, never reused or overwritten, so this is safe to cache forever.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "File not found." }, { status: 404 });
  }
}
