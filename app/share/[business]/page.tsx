"use client";

import { use, useEffect, useState } from "react";
import { CategoryPickerDialog } from "@/components/share-page/category-picker-dialog";
import { ClaimRewardSection } from "@/components/share-page/claim-reward-section";
import { FollowButton } from "@/components/share-page/follow-button";
import { ShareButton } from "@/components/share-page/share-button";
import { TemplatePickerDialog } from "@/components/share-page/template-picker-dialog";
import { WifiDialog } from "@/components/share-page/wifi-dialog";
import { Toast } from "@/components/link-generator/toast";
import { getBusinessById } from "@/lib/business";
import { loadLuckyDrawSettings } from "@/lib/lucky-draw-settings";
import type { Post } from "@/lib/mock-data";
import { loadPosts } from "@/lib/post-storage";
import { DEFAULT_PROFILE_DATA, fetchProfileData, type PlatformKey } from "@/lib/profile-storage";
import { listCategories, type GoogleReviewCategory } from "@/lib/review-categories";
import { filterReviewTemplates, type ReviewTemplate } from "@/lib/review-templates";
import { canUseLuckyDraw } from "@/lib/subscription";
import { trackingService } from "@/lib/tracking-service";

const GOOGLE_REVIEW_SHARE_NAME = "Google Review";

type PlatformDefinition = {
  key: PlatformKey;
  shareLabel: string;
  shareName: string;
  followLabel?: string;
  followName?: string;
};

const PLATFORM_ORDER: PlatformDefinition[] = [
  { key: "rednote", shareLabel: "Share to Rednote", shareName: "Rednote", followLabel: "Follow our XHS", followName: "XHS Follow" },
  { key: "igStory", shareLabel: "Share to IG story", shareName: "Instagram Story", followLabel: "Follow our IG", followName: "Instagram Follow" },
  { key: "facebook", shareLabel: "Share to Facebook", shareName: "Facebook", followLabel: "Follow our FB", followName: "Facebook Follow" },
  { key: "googleReview", shareLabel: "Rate us on Google Review", shareName: "Google Review" },
  { key: "tiktok", shareLabel: "Share to TikTok", shareName: "TikTok", followLabel: "Follow our TikTok", followName: "Tiktok Follow" },
  { key: "weixin", shareLabel: "Share to Weixin", shareName: "Weixin" },
  { key: "lemon8", shareLabel: "Share to Lemon8", shareName: "Lemon8", followLabel: "Follow our Lemon8", followName: "Lemon8 Follow" },
];

const FOLLOW_ORDER: PlatformKey[] = ["igStory", "facebook", "tiktok", "lemon8", "rednote"];

export default function CustomerSharePage({
  params,
}: {
  params: Promise<{ business: string }>;
}) {
  const { business: businessId } = use(params);

  const [profile, setProfile] = useState(DEFAULT_PROFILE_DATA);
  const [luckyDrawAllowed, setLuckyDrawAllowed] = useState(false);
  const [luckyDraw] = useState(() => loadLuckyDrawSettings(businessId));
  const [categories, setCategories] = useState<GoogleReviewCategory[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [wifiOpen, setWifiOpen] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [templateState, setTemplateState] = useState<{
    open: boolean;
    platform: string;
    templates: ReviewTemplate[];
    link: string;
  }>({ open: false, platform: "", templates: [], link: "" });

  useEffect(() => {
    let cancelled = false;

    function loadProfile() {
      fetchProfileData(businessId).then((loaded) => {
        if (!cancelled) setProfile(loaded);
      });
    }

    function loadPostsData() {
      loadPosts(businessId).then((loaded) => {
        if (!cancelled) setPosts(loaded);
      });
    }

    function loadCategoriesData() {
      listCategories(businessId).then((loaded) => {
        if (!cancelled) setCategories(loaded);
      });
    }

    function loadLuckyDrawAllowed() {
      getBusinessById(businessId).then((business) => {
        if (!cancelled) setLuckyDrawAllowed(business ? canUseLuckyDraw(business).allowed : false);
      });
    }

    loadProfile();
    loadCategoriesData();
    loadPostsData();
    loadLuckyDrawAllowed();
    trackingService.recordEvent(businessId, "Page Entry", "View");

    function refresh() {
      loadProfile();
      loadCategoriesData();
      loadPostsData();
    }
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildShareLink(shareName: string) {
    switch (shareName) {
      case "Google Review":
        return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(profile.business.googlePlaceId)}`;
      case "Rednote":
        return "https://www.xiaohongshu.com/explore";
      case "Instagram Story":
        return "https://www.instagram.com/";
      case "Facebook":
        return "https://www.facebook.com/sharer/sharer.php";
      case "TikTok":
        return "https://www.tiktok.com/upload";
      case "Weixin":
        return "https://weixin.qq.com/";
      case "Lemon8":
        return "https://www.lemon8-app.com/";
      default:
        return "#";
    }
  }

  function buildFollowLink(followName: string) {
    switch (followName) {
      case "Instagram Follow":
        return `https://www.instagram.com/${profile.business.instagramUsername}`;
      case "Facebook Follow":
        return `https://www.facebook.com/${profile.business.facebookUsername}`;
      case "XHS Follow":
        return `https://www.xiaohongshu.com/user/profile/${profile.business.xhsUserId}`;
      case "Tiktok Follow":
        return `https://www.tiktok.com/@${profile.business.tiktokUsername}`;
      case "Lemon8 Follow":
        return `https://www.lemon8-app.com/@${profile.business.lemon8Username}`;
      default:
        return "#";
    }
  }

  /**
   * Every platform's templates come straight from the business's own Active
   * Posts — there is no hardcoded review text anywhere. For Google Review
   * specifically, a categoryId further scopes the result to posts assigned
   * to that Google Review Category (categories only group Posts, they never
   * store review text themselves).
   */
  function resolveTemplates(shareName: string, categoryId?: string | null): ReviewTemplate[] {
    return filterReviewTemplates(posts, shareName, categoryId);
  }

  /** Whether tapping this platform's share button offers more than one thing to pick from. */
  function hasChoice(definition: PlatformDefinition): boolean {
    if (definition.shareName === GOOGLE_REVIEW_SHARE_NAME) {
      if (categories.length > 1) return true;
      return resolveTemplates(GOOGLE_REVIEW_SHARE_NAME, categories[0]?.id ?? null).length > 1;
    }
    return resolveTemplates(definition.shareName).length > 1;
  }

  async function copyAndRedirect(text: string, link: string, platform: string) {
    try {
      await navigator.clipboard.writeText(text);
      setToastMessage(`Review copied! Opening ${platform}...`);
    } catch {
      setToastMessage(`Opening ${platform}... (copy the review manually if needed)`);
    }
    trackingService.recordEvent(businessId, platform, "Share", link);
    window.open(link, "_blank", "noopener,noreferrer");
  }

  /** Shared tail-end of the Google Review flow once a category has been resolved (chosen, or skipped when there's at most one). */
  function proceedWithGoogleReview(categoryId: string | null) {
    const link = buildShareLink(GOOGLE_REVIEW_SHARE_NAME);
    const templates = resolveTemplates(GOOGLE_REVIEW_SHARE_NAME, categoryId);

    if (templates.length === 0) {
      trackingService.recordEvent(businessId, GOOGLE_REVIEW_SHARE_NAME, "Share", link);
      window.open(link, "_blank", "noopener,noreferrer");
    } else if (templates.length > 1) {
      setTemplateState({ open: true, platform: GOOGLE_REVIEW_SHARE_NAME, templates, link });
    } else {
      void copyAndRedirect(templates[0].text, link, GOOGLE_REVIEW_SHARE_NAME);
    }
  }

  function handleShareClick(definition: PlatformDefinition) {
    if (definition.shareName === GOOGLE_REVIEW_SHARE_NAME) {
      if (categories.length > 1) {
        setCategoryPickerOpen(true);
        return;
      }
      proceedWithGoogleReview(categories[0]?.id ?? null);
      return;
    }

    const link = buildShareLink(definition.shareName);
    const templates = resolveTemplates(definition.shareName);

    if (templates.length === 0) {
      trackingService.recordEvent(businessId, definition.shareName, "Share", link);
      window.open(link, "_blank", "noopener,noreferrer");
    } else if (templates.length > 1) {
      setTemplateState({ open: true, platform: definition.shareName, templates, link });
    } else {
      void copyAndRedirect(templates[0].text, link, definition.shareName);
    }
  }

  function handleCategorySelect(category: GoogleReviewCategory) {
    setCategoryPickerOpen(false);
    proceedWithGoogleReview(category.id);
  }

  function handleTemplateSelect(template: ReviewTemplate) {
    setTemplateState((prev) => ({ ...prev, open: false }));
    void copyAndRedirect(template.text, templateState.link, templateState.platform);
  }

  function handleFollowClick(definition: PlatformDefinition) {
    if (!definition.followName) return;
    const link = buildFollowLink(definition.followName);
    trackingService.recordEvent(businessId, definition.followName, "Follow", link);
    window.open(link, "_blank", "noopener,noreferrer");
  }

  function handleWifiClick() {
    trackingService.recordEvent(businessId, "WiFi Connect", "Connect");
    setWifiOpen(true);
  }

  function handleCopyWifiPassword() {
    void navigator.clipboard.writeText(profile.wifi.password).then(
      () => setToastMessage("WiFi password copied!"),
      () => setToastMessage("Unable to copy password.")
    );
  }

  function handleCustomWebpageClick() {
    trackingService.recordEvent(businessId, "Custom Webpage", "Visit", profile.customWebPage.customLink);
    window.open(profile.customWebPage.customLink, "_blank", "noopener,noreferrer");
  }

  function handleSubmitted(result: { hasProofImage: boolean; luckyDrawEntry: boolean }) {
    if (result.hasProofImage) {
      trackingService.recordEvent(businessId, "Upload Proof", "Submit");
    }
    if (result.luckyDrawEntry) {
      trackingService.recordEvent(businessId, "Lucky Draw Entry", "Entry");
    }
    setToastMessage("Submitted successfully! Thank you.");
  }

  const visiblePlatforms = PLATFORM_ORDER.filter(
    (definition) => profile.platformVisibility[definition.key]
  );
  const shareButtons = visiblePlatforms;
  const followButtons = FOLLOW_ORDER.map((key) =>
    visiblePlatforms.find((definition) => definition.key === key)
  ).filter((definition): definition is PlatformDefinition => Boolean(definition?.followName));
  const showWifiButton = profile.wifi.ssid.trim().length > 0;
  const showCustomWebpage = profile.customWebPage.customLink.trim().length > 0;

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-black to-[#71717a] bg-cover bg-center pb-16"
      style={
        profile.backgroundImage
          ? {
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(113,113,122,0.75)), url(${profile.backgroundImage})`,
            }
          : undefined
      }
    >
      <div className="mx-auto w-full max-w-md space-y-4 px-5 pt-10">
        <div className="flex flex-col items-center">
          <div className="relative size-40 overflow-hidden rounded-[28px] shadow-lg">
            {profile.profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.profileImage}
                alt="Business profile"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-[#e0777d] to-[#c85a63] p-2">
                <span className="text-4xl">🐻</span>
                <span className="max-w-full truncate text-center text-sm font-black tracking-wide text-white">
                  {profile.business.name || "Your Business"}
                </span>
              </div>
            )}
          </div>

          <h1 className="mt-6 text-center text-2xl font-bold text-white">
            Share now, earn rewards!
          </h1>
        </div>

        <div className="space-y-3">
          {shareButtons.map((definition) => (
            <ShareButton
              key={definition.key}
              platform={definition.shareName}
              label={definition.shareLabel}
              hasMultipleTemplates={hasChoice(definition)}
              onClick={() => handleShareClick(definition)}
              onMoreClick={() => handleShareClick(definition)}
            />
          ))}
        </div>

        {(followButtons.length > 0 || showWifiButton) && (
          <div className="grid grid-cols-2 gap-3">
            {followButtons.map((definition) => (
              <FollowButton
                key={definition.key}
                platform={definition.followName!}
                label={definition.followLabel!}
                onClick={() => handleFollowClick(definition)}
              />
            ))}
            {showWifiButton && (
              <FollowButton
                platform="WiFi Connect"
                label="Connect WiFi"
                onClick={handleWifiClick}
              />
            )}
          </div>
        )}

        {showCustomWebpage && (
          <button
            type="button"
            onClick={handleCustomWebpageClick}
            className="w-full rounded-2xl bg-[#0a0a0a] py-4 text-base font-bold text-white"
          >
            {profile.customWebPage.customText || "Visit our page"}
          </button>
        )}

        <ClaimRewardSection
          businessId={businessId}
          showCustomerForm={profile.buttonConfig.askCustomerInputDetails}
          showUploadProof={profile.buttonConfig.uploadImageProof}
          showLuckyDraw={luckyDraw.enabled && luckyDrawAllowed}
          luckyDrawPrize={luckyDraw.prizeDescription}
          onSubmitted={handleSubmitted}
        />
      </div>

      <CategoryPickerDialog
        open={categoryPickerOpen}
        onOpenChange={setCategoryPickerOpen}
        categories={categories}
        onSelect={handleCategorySelect}
      />

      <TemplatePickerDialog
        open={templateState.open}
        onOpenChange={(open) => setTemplateState((prev) => ({ ...prev, open }))}
        platform={templateState.platform}
        templates={templateState.templates}
        onSelect={handleTemplateSelect}
      />

      <WifiDialog
        open={wifiOpen}
        onOpenChange={setWifiOpen}
        ssid={profile.wifi.ssid}
        password={profile.wifi.password}
        onCopyPassword={handleCopyWifiPassword}
      />

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </div>
  );
}
