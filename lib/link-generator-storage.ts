import { DEMO_BUSINESS } from "@/lib/business";
import { buildShareUrl } from "@/lib/app-url";

export type LinkGeneratorData = {
  staticPageLink: string;
  xhsShareLink: string;
};

/**
 * Default Static Page Link / XHS Share Link values for a business that
 * hasn't customized them yet — both point at this business's own Share Page
 * on our own domain, never a third-party link shortener.
 */
export function getDefaultLinkGeneratorData(businessId: string): LinkGeneratorData {
  const shareUrl = buildShareUrl(businessId);
  return {
    staticPageLink: shareUrl,
    xhsShareLink: shareUrl,
  };
}

const LEGACY_STORAGE_KEY = "premo-link-generator-data";

function storageKey(businessId: string) {
  return `premo-link-generator-data:${businessId}`;
}

/** Retired third-party link shortener this app used before generating its own Share Page URLs — never trust a persisted value pointing at it. */
const RETIRED_DOMAIN = "jshare.link";

/** A dev-server origin (localhost/127.0.0.1, any port) — never a real production domain. */
const DEV_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * Whether a persisted value is actually one of OUR OWN auto-generated Share
 * Page links, just computed against a stale dev origin — as opposed to a
 * business's genuine custom URL, which would essentially never coincidentally
 * take the exact shape "{origin}/share/{this business's own id}". Matching
 * only that exact shape (not "any non-production origin") means a business's
 * real customization is never touched.
 */
function isStaleGeneratedLink(value: string, businessId: string): boolean {
  if (value.includes(RETIRED_DOMAIN)) return true;

  try {
    const url = new URL(value);
    return DEV_ORIGIN_PATTERN.test(url.origin) && url.pathname === `/share/${businessId}`;
  } catch {
    return false;
  }
}

/** Drops any persisted field that's actually a stale auto-generated default, so old browser storage self-heals instead of freezing a business onto a dead/dev link forever. */
function discardStaleValues(
  parsed: Partial<LinkGeneratorData>,
  businessId: string
): Partial<LinkGeneratorData> {
  const sanitized = { ...parsed };
  for (const key of Object.keys(sanitized) as (keyof LinkGeneratorData)[]) {
    const value = sanitized[key];
    if (value && isStaleGeneratedLink(value, businessId)) delete sanitized[key];
  }
  return sanitized;
}

export function loadLinkGeneratorData(businessId: string): LinkGeneratorData {
  const defaults = getDefaultLinkGeneratorData(businessId);
  if (typeof window === "undefined") return defaults;

  try {
    const raw =
      window.localStorage.getItem(storageKey(businessId)) ??
      (businessId === DEMO_BUSINESS.id
        ? window.localStorage.getItem(LEGACY_STORAGE_KEY)
        : null);
    if (!raw) return defaults;

    const parsed = JSON.parse(raw) as Partial<LinkGeneratorData>;
    return { ...defaults, ...discardStaleValues(parsed, businessId) };
  } catch {
    return defaults;
  }
}

export function saveLinkGeneratorData(businessId: string, data: LinkGeneratorData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(businessId), JSON.stringify(data));
}
