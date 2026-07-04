/**
 * Client-side password hashing for this localStorage-only demo app (there is
 * no backend to hash passwords server-side). Uses the Web Crypto API
 * (SHA-256) with a random salt per password — never store or compare
 * plaintext passwords anywhere in this app.
 *
 * In a real product with a server, this would be replaced with a proper
 * server-side algorithm like bcrypt/argon2. This is the closest honest
 * equivalent achievable entirely in the browser.
 */

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function randomSaltHex(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Returns a "salt:hash" string suitable for storage. Never store the plaintext password. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomSaltHex();
  const hash = await sha256Hex(`${salt}:${password}`);
  return `${salt}:${hash}`;
}

/** Compares a plaintext password against a stored "salt:hash" string. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  return (await sha256Hex(`${salt}:${password}`)) === hash;
}

// Salt length isn't fixed-width (the seeded demo admin uses a human-readable
// placeholder salt), so only the hash half — always a 64-char SHA-256 hex
// digest — is checked strictly.
const HASHED_PASSWORD_PATTERN = /^[^:]+:[0-9a-f]{64}$/;

/** Whether a stored value is already a "salt:hash" string produced by hashPassword. */
export function isHashedPassword(value: string): boolean {
  return HASHED_PASSWORD_PATTERN.test(value);
}
