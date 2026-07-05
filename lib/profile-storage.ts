import { DEMO_BUSINESS } from "@/lib/business";

export type PlatformKey =
  | "rednote"
  | "tiktok"
  | "igStory"
  | "googleReview"
  | "facebook"
  | "weixin"
  | "lemon8";

export type PlatformToggles = Record<PlatformKey, boolean>;

export type MaxRefreshOption = "1" | "3" | "custom";

export type ProfileData = {
  profileImage: string | null;
  backgroundImage: string | null;
  business: {
    name: string;
    instagramUsername: string;
    facebookUsername: string;
    xhsUserId: string;
    tiktokUsername: string;
    lemon8Username: string;
    googlePlaceId: string;
    whatsappNumber: string;
    slogan: string;
  };
  customWebPage: {
    image: string | null;
    customText: string;
    customLink: string;
  };
  wifi: {
    ssid: string;
    password: string;
  };
  platformBypass: {
    maxRefreshOption: MaxRefreshOption;
    customRefreshCount: string;
    platforms: PlatformToggles;
  };
  buttonConfig: {
    googleCopyButton: boolean;
    askCustomerInputDetails: boolean;
    uploadImageProof: boolean;
    toggleWatermark: boolean;
    postSwitching: boolean;
  };
  languagePreference: {
    english: boolean;
    chinese: boolean;
  };
  platformVisibility: PlatformToggles;
  instructions: {
    instagram: string;
    tiktok: string;
    facebook: string;
    weixin: string;
    googleReview: string;
    lemon8: string;
  };
};

export const PLATFORM_LABELS: Record<PlatformKey, string> = {
  rednote: "Rednote",
  tiktok: "Tiktok",
  igStory: "Ig Story",
  googleReview: "Google Review",
  facebook: "Facebook",
  weixin: "Weixin",
  lemon8: "Lemon8",
};

export const PLATFORM_ORDER: PlatformKey[] = [
  "rednote",
  "tiktok",
  "igStory",
  "googleReview",
  "facebook",
  "weixin",
  "lemon8",
];

/**
 * Blank-slate defaults for any business that hasn't set up its profile yet.
 * Deliberately free of any brand-specific identity/contact values (business
 * name, social usernames, Google Place ID, WhatsApp number, WiFi
 * credentials, custom website) so a new business never inherits another
 * business's demo data.
 */
export const DEFAULT_PROFILE_DATA: ProfileData = {
  profileImage: null,
  backgroundImage: null,
  business: {
    name: "",
    instagramUsername: "",
    facebookUsername: "",
    xhsUserId: "",
    tiktokUsername: "",
    lemon8Username: "",
    googlePlaceId: "",
    whatsappNumber: "",
    slogan: "",
  },
  customWebPage: {
    image: null,
    customText: "Booking Us",
    customLink: "",
  },
  wifi: {
    ssid: "",
    password: "",
  },
  platformBypass: {
    maxRefreshOption: "3",
    customRefreshCount: "",
    platforms: {
      rednote: true,
      tiktok: false,
      igStory: false,
      googleReview: true,
      facebook: false,
      weixin: false,
      lemon8: false,
    },
  },
  buttonConfig: {
    googleCopyButton: true,
    askCustomerInputDetails: false,
    uploadImageProof: false,
    toggleWatermark: true,
    postSwitching: true,
  },
  languagePreference: {
    english: false,
    chinese: false,
  },
  platformVisibility: {
    rednote: true,
    tiktok: false,
    igStory: true,
    googleReview: true,
    facebook: true,
    weixin: false,
    lemon8: false,
  },
  instructions: {
    instagram: "",
    tiktok: "",
    facebook: "",
    weixin: "",
    googleReview: "5 star",
    lemon8: "",
  },
};

/**
 * The pre-existing demo business keeps its original example content so the
 * demo keeps working end-to-end, but this data only ever applies to
 * DEMO_BUSINESS.id — every other business starts from DEFAULT_PROFILE_DATA.
 */
const DEMO_PROFILE_DATA: ProfileData = {
  ...DEFAULT_PROFILE_DATA,
  business: {
    ...DEFAULT_PROFILE_DATA.business,
    name: DEMO_BUSINESS.name,
    instagramUsername: "premo_studio",
    facebookUsername: "studiopremo",
    xhsUserId: "5cbfcb21000000001603e8c7",
    googlePlaceId: "ChIJh_AxOC9LzDERzk7qrLYEldk",
  },
  customWebPage: {
    ...DEFAULT_PROFILE_DATA.customWebPage,
    customLink: "https://premostudio.minibookit.com/",
  },
  wifi: {
    ssid: "PREMO production",
    password: "PREMO8888",
  },
};

function defaultsFor(businessId: string): ProfileData {
  return businessId === DEMO_BUSINESS.id ? DEMO_PROFILE_DATA : DEFAULT_PROFILE_DATA;
}

/** Fills in any missing/partial fields of a loaded profile with this business's defaults. */
function mergeWithDefaults(defaults: ProfileData, parsed: Partial<ProfileData>): ProfileData {
  return {
    ...defaults,
    ...parsed,
    business: { ...defaults.business, ...parsed.business },
    customWebPage: { ...defaults.customWebPage, ...parsed.customWebPage },
    wifi: { ...defaults.wifi, ...parsed.wifi },
    platformBypass: {
      ...defaults.platformBypass,
      ...parsed.platformBypass,
      platforms: {
        ...defaults.platformBypass.platforms,
        ...parsed.platformBypass?.platforms,
      },
    },
    buttonConfig: { ...defaults.buttonConfig, ...parsed.buttonConfig },
    languagePreference: {
      ...defaults.languagePreference,
      ...parsed.languagePreference,
    },
    platformVisibility: {
      ...defaults.platformVisibility,
      ...parsed.platformVisibility,
    },
    instructions: { ...defaults.instructions, ...parsed.instructions },
  };
}

/**
 * Fetches a business's profile from the Profile API (GET /api/profile),
 * scoped by businessId, merging any partial/missing fields with this
 * business's defaults so a legacy or hand-edited JSON file on disk can never
 * produce a profile object with missing nested fields downstream.
 */
export async function fetchProfileData(businessId: string): Promise<ProfileData> {
  const defaults = defaultsFor(businessId);

  try {
    const res = await fetch(`/api/profile?businessId=${encodeURIComponent(businessId)}`);
    if (!res.ok) return defaults;

    const parsed: unknown = await res.json();
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return defaults;

    return mergeWithDefaults(defaults, parsed as Partial<ProfileData>);
  } catch {
    return defaults;
  }
}
