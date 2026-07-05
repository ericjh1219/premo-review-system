/**
 * The application's own public URL, set via NEXT_PUBLIC_APP_URL so every
 * generated link (Share Page, Link Generator, QR Codes) always points at
 * our own domain — never a third-party link shortener — in both
 * development (http://localhost:3000) and production
 * (https://review.premostudio.my).
 */
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
  /\/$/,
  ""
);

/** Builds a business's public Share Page URL on our own domain. */
export function buildShareUrl(businessId: string): string {
  return `${APP_URL}/share/${businessId}`;
}

/** True when NEXT_PUBLIC_APP_URL points at a local dev server rather than the production domain. */
export function isDevelopmentAppUrl(): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(APP_URL);
}
