import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { UPLOAD_DIR } from "@/lib/server/upload-storage";

// Route Handlers default to the Node.js runtime, but this is pinned
// explicitly because "fs" and "crypto" are unavailable on the Edge runtime.
export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Extensions are derived from the validated MIME type, never from the
// client-supplied filename, so the on-disk name is fully server-controlled.
const ALLOWED_TYPES: Record<string, { extension: string; signature: (buf: Buffer) => boolean }> = {
  "image/jpeg": {
    extension: ".jpg",
    signature: (buf) => buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff,
  },
  "image/png": {
    extension: ".png",
    signature: (buf) =>
      buf.length >= 8 &&
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a,
  },
  "image/webp": {
    extension: ".webp",
    signature: (buf) =>
      buf.length >= 12 &&
      buf.toString("ascii", 0, 4) === "RIFF" &&
      buf.toString("ascii", 8, 12) === "WEBP",
  },
};

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File exceeds the 5MB size limit." },
        { status: 413 }
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { success: false, error: "Expected multipart/form-data with a 'file' field." },
        { status: 400 }
      );
    }

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { success: false, error: "No file provided." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File exceeds the 5MB size limit." },
        { status: 413 }
      );
    }

    const allowed = ALLOWED_TYPES[file.type];
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Unsupported file type. Allowed: JPEG, PNG, WEBP." },
        { status: 415 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!allowed.signature(buffer)) {
      return NextResponse.json(
        { success: false, error: "File content does not match its declared type." },
        { status: 415 }
      );
    }

    const filename = `${randomUUID()}${allowed.extension}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(filePath, buffer, { mode: 0o644 });
    // Confirms the file is actually readable back from disk before telling
    // the client it succeeded, instead of trusting the write blindly.
    await fs.access(filePath);

    // Served back through our own route (app/api/uploads/[filename]) rather
    // than a bare /uploads/ static path, so read and write always resolve
    // the same directory regardless of what process.cwd() the server was
    // actually launched from.
    return NextResponse.json({
      success: true,
      url: `/api/uploads/${filename}`,
      filename,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to process upload." },
      { status: 500 }
    );
  }
}
