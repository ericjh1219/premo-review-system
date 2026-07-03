export type LuckyDrawSettings = {
  enabled: boolean;
  prizeDescription: string;
};

const STORAGE_KEY = "premo-lucky-draw-settings";

/**
 * There is currently no admin UI for toggling Lucky Draw (the Profile page's
 * "Lucky Draw" tab is out of scope for this feature), so this defaults to
 * disabled — matching the reference screenshot, where no Lucky Draw section
 * is shown. Once an admin control exists, it can write to the same key.
 */
export const DEFAULT_LUCKY_DRAW_SETTINGS: LuckyDrawSettings = {
  enabled: false,
  prizeDescription: "Win a free photo session!",
};

export function loadLuckyDrawSettings(): LuckyDrawSettings {
  if (typeof window === "undefined") return DEFAULT_LUCKY_DRAW_SETTINGS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LUCKY_DRAW_SETTINGS;
    return { ...DEFAULT_LUCKY_DRAW_SETTINGS, ...(JSON.parse(raw) as Partial<LuckyDrawSettings>) };
  } catch {
    return DEFAULT_LUCKY_DRAW_SETTINGS;
  }
}
