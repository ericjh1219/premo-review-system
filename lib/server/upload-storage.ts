import path from "path";

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/** Filenames this app ever generates: a UUID plus one of the known extensions — rejects anything else, including path traversal attempts. */
const SAFE_FILENAME_PATTERN = /^[0-9a-f-]+\.(jpg|png|webp)$/;

export function isSafeUploadFilename(filename: string): boolean {
  return SAFE_FILENAME_PATTERN.test(filename);
}
