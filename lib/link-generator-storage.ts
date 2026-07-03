export type LinkGeneratorData = {
  staticPageLink: string;
  xhsShareLink: string;
};

export const DEFAULT_LINK_GENERATOR_DATA: LinkGeneratorData = {
  staticPageLink: "https://jshare.link/share/Premo/ZT68/",
  xhsShareLink: "https://jshare.link/share/Premo/1uXU",
};

const STORAGE_KEY = "premo-link-generator-data";

export function loadLinkGeneratorData(): LinkGeneratorData {
  if (typeof window === "undefined") return DEFAULT_LINK_GENERATOR_DATA;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LINK_GENERATOR_DATA;

    const parsed = JSON.parse(raw) as Partial<LinkGeneratorData>;
    return { ...DEFAULT_LINK_GENERATOR_DATA, ...parsed };
  } catch {
    return DEFAULT_LINK_GENERATOR_DATA;
  }
}

export function saveLinkGeneratorData(data: LinkGeneratorData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
