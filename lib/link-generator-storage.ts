import { DEMO_BUSINESS } from "@/lib/business";

export type LinkGeneratorData = {
  staticPageLink: string;
  xhsShareLink: string;
};

export const DEFAULT_LINK_GENERATOR_DATA: LinkGeneratorData = {
  staticPageLink: "https://jshare.link/share/Premo/ZT68/",
  xhsShareLink: "https://jshare.link/share/Premo/1uXU",
};

const LEGACY_STORAGE_KEY = "premo-link-generator-data";

function storageKey(businessId: string) {
  return `premo-link-generator-data:${businessId}`;
}

export function loadLinkGeneratorData(businessId: string): LinkGeneratorData {
  if (typeof window === "undefined") return DEFAULT_LINK_GENERATOR_DATA;

  try {
    const raw =
      window.localStorage.getItem(storageKey(businessId)) ??
      (businessId === DEMO_BUSINESS.id
        ? window.localStorage.getItem(LEGACY_STORAGE_KEY)
        : null);
    if (!raw) return DEFAULT_LINK_GENERATOR_DATA;

    const parsed = JSON.parse(raw) as Partial<LinkGeneratorData>;
    return { ...DEFAULT_LINK_GENERATOR_DATA, ...parsed };
  } catch {
    return DEFAULT_LINK_GENERATOR_DATA;
  }
}

export function saveLinkGeneratorData(businessId: string, data: LinkGeneratorData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(businessId), JSON.stringify(data));
}
