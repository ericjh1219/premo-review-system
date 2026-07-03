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
    instagramUsername: string;
    facebookUsername: string;
    xhsUserId: string;
    tiktokUsername: string;
    lemon8Username: string;
    googlePlaceId: string;
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

export const DEFAULT_PROFILE_DATA: ProfileData = {
  profileImage: null,
  backgroundImage: null,
  business: {
    instagramUsername: "premo_studio",
    facebookUsername: "studiopremo",
    xhsUserId: "5cbfcb21000000001603e8c7",
    tiktokUsername: "",
    lemon8Username: "",
    googlePlaceId: "ChIJh_AxOC9LzDERzk7qrLYEldk",
    slogan: "",
  },
  customWebPage: {
    image: null,
    customText: "Booking Us",
    customLink: "https://premostudio.minibookit.com/",
  },
  wifi: {
    ssid: "PREMO production",
    password: "PREMO8888",
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

const STORAGE_KEY = "premo-profile-data";

export function loadProfileData(): ProfileData {
  if (typeof window === "undefined") return DEFAULT_PROFILE_DATA;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE_DATA;

    const parsed = JSON.parse(raw) as Partial<ProfileData>;
    return {
      ...DEFAULT_PROFILE_DATA,
      ...parsed,
      business: { ...DEFAULT_PROFILE_DATA.business, ...parsed.business },
      customWebPage: { ...DEFAULT_PROFILE_DATA.customWebPage, ...parsed.customWebPage },
      wifi: { ...DEFAULT_PROFILE_DATA.wifi, ...parsed.wifi },
      platformBypass: {
        ...DEFAULT_PROFILE_DATA.platformBypass,
        ...parsed.platformBypass,
        platforms: {
          ...DEFAULT_PROFILE_DATA.platformBypass.platforms,
          ...parsed.platformBypass?.platforms,
        },
      },
      buttonConfig: { ...DEFAULT_PROFILE_DATA.buttonConfig, ...parsed.buttonConfig },
      languagePreference: {
        ...DEFAULT_PROFILE_DATA.languagePreference,
        ...parsed.languagePreference,
      },
      platformVisibility: {
        ...DEFAULT_PROFILE_DATA.platformVisibility,
        ...parsed.platformVisibility,
      },
      instructions: { ...DEFAULT_PROFILE_DATA.instructions, ...parsed.instructions },
    };
  } catch {
    return DEFAULT_PROFILE_DATA;
  }
}

export function saveProfileData(data: ProfileData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
