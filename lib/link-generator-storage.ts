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

/** Drops any persisted field that still points at a retired/foreign domain, so old browser storage self-heals instead of freezing a business onto a dead link forever. */
function discardStaleValues(
  defaults: LinkGeneratorData,
  parsed: Partial<LinkGeneratorData>
): Partial<LinkGeneratorData> {
  const sanitized = { ...parsed };
  for (const key of Object.keys(sanitized) as (keyof LinkGeneratorData)[]) {
    if (sanitized[key]?.includes(RETIRED_DOMAIN)) delete sanitized[key];
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
    return { ...defaults, ...discardStaleValues(defaults, parsed) };
  } catch {
    return defaults;
  }
}

export function saveLinkGeneratorData(businessId: string, data: LinkGeneratorData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(businessId), JSON.stringify(data));
}
