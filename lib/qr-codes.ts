import type { ProfileData } from "@/lib/profile-storage";
import { buildShareUrl } from "@/lib/app-url";

export type QrCodeEntry = {
  id: string;
  label: string;
  /** Matches PlatformIcon's platform keys so icons stay visually consistent with the Share Page. */
  platform: string;
  /** Empty string means this QR isn't configured yet (the underlying profile field is blank). */
  value: string;
};

/**
 * Builds the business's QR codes directly from its current Business Profile
 * and business id, so any Profile change (Business ID, Google Place ID,
 * social usernames, WiFi, custom website) is reflected the next time this
 * is called — there is nothing else to keep in sync.
 */
export function buildQrCodeEntries(businessId: string, profile: ProfileData): QrCodeEntry[] {
  const { business, wifi, customWebPage } = profile;

  return [
    {
      id: "share-page",
      label: "Share Page",
      platform: "Share Page",
      value: buildShareUrl(businessId),
    },
    {
      id: "google-review",
      label: "Google Review",
      platform: "Google Review",
      value: business.googlePlaceId.trim()
        ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(business.googlePlaceId.trim())}`
        : "",
    },
    {
      id: "facebook",
      label: "Facebook",
      platform: "Facebook Follow",
      value: business.facebookUsername.trim()
        ? `https://www.facebook.com/${business.facebookUsername.trim()}`
        : "",
    },
    {
      id: "instagram",
      label: "Instagram",
      platform: "Instagram Follow",
      value: business.instagramUsername.trim()
        ? `https://www.instagram.com/${business.instagramUsername.trim()}`
        : "",
    },
    {
      id: "xiaohongshu",
      label: "Xiaohongshu",
      platform: "XHS Follow",
      value: business.xhsUserId.trim()
        ? `https://www.xiaohongshu.com/user/profile/${business.xhsUserId.trim()}`
        : "",
    },
    {
      id: "wifi",
      label: "WiFi",
      platform: "WiFi Connect",
      value: wifi.ssid.trim() ? `WIFI:T:WPA;S:${wifi.ssid.trim()};P:${wifi.password};;` : "",
    },
    {
      id: "custom-website",
      label: "Custom Website",
      platform: "Custom Website",
      value: customWebPage.customLink.trim(),
    },
  ];
}
