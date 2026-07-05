/**
 * The application's own public URL, set via NEXT_PUBLIC_APP_URL so every
 * generated link (Share Page, Link Generator, QR Codes) always points at
 * our own domain — never a third-party link shortener — in both
 * development (http://localhost:3000) and production
 * (https://review.premostudio.my). Only used as a fallback for contexts
 * without a browser (SSR/build); see resolveAppOrigin() for the value
 * actually used when generating links.
 */
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
  /\/$/,
  ""
);

/**
 * The origin to use for links we generate ourselves. Every call site for
 * this lives in a client component invoked after mount, so we prefer the
 * browser's actual origin — it's always correct regardless of whether
 * NEXT_PUBLIC_APP_URL was set when this build was produced. Falls back to
 * APP_URL only for the rare non-browser context (SSR/static generation).
 */
export function resolveAppOrigin(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  return APP_URL;
}

/** Builds a business's public Share Page URL on our own domain. */
export function buildShareUrl(businessId: string): string {
  return `${resolveAppOrigin()}/share/${businessId}`;
}

/** True when the app is currently being served from a local dev server rather than the production domain. */
export function isDevelopmentAppUrl(): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(resolveAppOrigin());
}

// NEXT_PUBLIC_* values are inlined at build time, so a production build that
// still resolves to the localhost fallback means NEXT_PUBLIC_APP_URL wasn't
// set when `next build` ran — surface that loudly instead of silently
// generating localhost links in production.
if (process.env.NODE_ENV === "production" && isDevelopmentAppUrl()) {
  console.error(
    "[premo] NEXT_PUBLIC_APP_URL was not set at build time — generated links will incorrectly point at",
    APP_URL,
    "instead of the production domain. Set NEXT_PUBLIC_APP_URL and rebuild."
  );
}
