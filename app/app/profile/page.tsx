"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Trophy, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BottomNav } from "@/components/link-generator/bottom-nav";
import { Toast } from "@/components/link-generator/toast";
import { ImageUploadField } from "@/components/link-generator/profile/image-upload-field";
import { ToggleRow } from "@/components/link-generator/profile/toggle-row";
import { resolveBusinessId } from "@/lib/auth";
import {
  DEFAULT_PROFILE_DATA,
  PLATFORM_LABELS,
  PLATFORM_ORDER,
  loadProfileData,
  saveProfileData,
  type MaxRefreshOption,
  type ProfileData,
} from "@/lib/profile-storage";
import { cn } from "@/lib/utils";

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-[#e7e0d3] pb-2">
      <h2 className="text-base font-bold text-[#1a1a1a]">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-[#78716c]">{description}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData>(DEFAULT_PROFILE_DATA);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setData(loadProfileData(resolveBusinessId()));
  }, []);

  function updateBusiness<K extends keyof ProfileData["business"]>(
    key: K,
    value: ProfileData["business"][K]
  ) {
    setData((prev) => ({ ...prev, business: { ...prev.business, [key]: value } }));
  }

  function updateCustomWebPage<K extends keyof ProfileData["customWebPage"]>(
    key: K,
    value: ProfileData["customWebPage"][K]
  ) {
    setData((prev) => ({ ...prev, customWebPage: { ...prev.customWebPage, [key]: value } }));
  }

  function updateWifi<K extends keyof ProfileData["wifi"]>(
    key: K,
    value: ProfileData["wifi"][K]
  ) {
    setData((prev) => ({ ...prev, wifi: { ...prev.wifi, [key]: value } }));
  }

  function updateButtonConfig<K extends keyof ProfileData["buttonConfig"]>(
    key: K,
    value: ProfileData["buttonConfig"][K]
  ) {
    setData((prev) => ({ ...prev, buttonConfig: { ...prev.buttonConfig, [key]: value } }));
  }

  function updateInstructions<K extends keyof ProfileData["instructions"]>(
    key: K,
    value: ProfileData["instructions"][K]
  ) {
    setData((prev) => ({ ...prev, instructions: { ...prev.instructions, [key]: value } }));
  }

  function togglePlatformBypass(key: keyof ProfileData["platformBypass"]["platforms"]) {
    setData((prev) => ({
      ...prev,
      platformBypass: {
        ...prev.platformBypass,
        platforms: {
          ...prev.platformBypass.platforms,
          [key]: !prev.platformBypass.platforms[key],
        },
      },
    }));
  }

  function togglePlatformVisibility(key: keyof ProfileData["platformVisibility"]) {
    setData((prev) => ({
      ...prev,
      platformVisibility: {
        ...prev.platformVisibility,
        [key]: !prev.platformVisibility[key],
      },
    }));
  }

  function setMaxRefreshOption(option: MaxRefreshOption) {
    setData((prev) => ({
      ...prev,
      platformBypass: { ...prev.platformBypass, maxRefreshOption: option },
    }));
  }

  function toggleLanguage(key: "english" | "chinese") {
    setData((prev) => ({
      ...prev,
      languagePreference: {
        ...prev.languagePreference,
        [key]: !prev.languagePreference[key],
      },
    }));
  }

  function selectAllLanguages() {
    setData((prev) => ({
      ...prev,
      languagePreference: { english: true, chinese: true },
    }));
  }

  function clearAllLanguages() {
    setData((prev) => ({
      ...prev,
      languagePreference: { english: false, chinese: false },
    }));
  }

  function clearCustomWebPage() {
    setData((prev) => ({
      ...prev,
      customWebPage: { image: null, customText: "", customLink: "" },
    }));
  }

  function handleSave() {
    const result = saveProfileData(resolveBusinessId(), data);
    setToastMessage(result.success ? "Profile saved successfully." : (result.error ?? "Unable to save profile."));
  }

  const languageSelectedCount = Number(data.languagePreference.english) + Number(data.languagePreference.chinese);

  return (
    <div className="min-h-screen bg-[#fdf1e3] pb-28">
      <div className="mx-auto w-full max-w-2xl space-y-6 px-5 pt-6 sm:px-6 sm:pt-8">
        <div className="mx-auto flex w-fit items-center gap-1 rounded-full bg-white/70 p-1 shadow-sm">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#1a1a1a] shadow-sm"
          >
            <User className="size-4" />
            Profile
          </button>
          <button
            type="button"
            disabled
            className="flex cursor-not-allowed items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-[#78716c]"
          >
            <Trophy className="size-4" />
            Lucky Draw
          </button>
        </div>

        <h1 className="text-xl font-bold text-[#1a1a1a]">Your Profile</h1>

        <div className="flex gap-8">
          <ImageUploadField
            label="Profile Image"
            image={data.profileImage}
            onChange={(dataUrl) => setData((prev) => ({ ...prev, profileImage: dataUrl }))}
            className="bg-gradient-to-br from-[#e0777d] to-[#c85a63]"
            placeholder={
              <div className="flex size-full items-center justify-center">
                <ImageIcon className="size-8 text-white/80" />
              </div>
            }
          />
          <ImageUploadField
            label="Background Image"
            image={data.backgroundImage}
            onChange={(dataUrl) => setData((prev) => ({ ...prev, backgroundImage: dataUrl }))}
            className="border-2 border-dashed border-[#d6d3d1] bg-[#f5f5f4]"
            placeholder={
              <div className="flex size-full items-center justify-center">
                <ImageIcon className="size-8 text-[#a8a29e]" />
              </div>
            }
          />
        </div>

        <div className="space-y-4">
          <SectionHeading title="Business Information" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-[#57534e]">Business Name</label>
              <Input
                value={data.business.name}
                onChange={(e) => updateBusiness("name", e.target.value)}
                placeholder="Enter Business Name"
                className="h-11 rounded-lg border-[#d6d3d1] bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#57534e]">Instagram Username</label>
              <Input
                value={data.business.instagramUsername}
                onChange={(e) => updateBusiness("instagramUsername", e.target.value)}
                placeholder="Enter Instagram Username"
                className="h-11 rounded-lg border-[#d6d3d1] bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#57534e]">Facebook Username</label>
              <Input
                value={data.business.facebookUsername}
                onChange={(e) => updateBusiness("facebookUsername", e.target.value)}
                placeholder="Enter Facebook Username"
                className="h-11 rounded-lg border-[#d6d3d1] bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#57534e]">XHS User Id</label>
              <Input
                value={data.business.xhsUserId}
                onChange={(e) => updateBusiness("xhsUserId", e.target.value)}
                placeholder="Enter XHS User Id"
                className="h-11 rounded-lg border-[#d6d3d1] bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#57534e]">Tiktok Username</label>
              <Input
                value={data.business.tiktokUsername}
                onChange={(e) => updateBusiness("tiktokUsername", e.target.value)}
                placeholder="Enter Tiktok Username"
                className="h-11 rounded-lg border-[#d6d3d1] bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#57534e]">Lemon8 Username</label>
              <Input
                value={data.business.lemon8Username}
                onChange={(e) => updateBusiness("lemon8Username", e.target.value)}
                placeholder="Enter Lemon8 Username"
                className="h-11 rounded-lg border-[#d6d3d1] bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-[#57534e]">
                Google Place ID
                <a
                  href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600"
                >
                  Get ID
                </a>
              </label>
              <Input
                value={data.business.googlePlaceId}
                onChange={(e) => updateBusiness("googlePlaceId", e.target.value)}
                placeholder="Enter Google Place ID"
                className="h-11 rounded-lg border-[#d6d3d1] bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#57534e]">WhatsApp Number</label>
              <Input
                value={data.business.whatsappNumber}
                onChange={(e) => updateBusiness("whatsappNumber", e.target.value)}
                placeholder="Enter WhatsApp Number"
                className="h-11 rounded-lg border-[#d6d3d1] bg-white"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-[#57534e]">Slogan</label>
              <Input
                value={data.business.slogan}
                onChange={(e) => updateBusiness("slogan", e.target.value)}
                placeholder="Enter Slogan"
                className="h-11 rounded-lg border-[#d6d3d1] bg-white"
              />
            </div>
          </div>
        </div>

        <div className="relative rounded-2xl border border-[#e7e0d3] bg-white p-4">
          <button
            type="button"
            aria-label="Clear custom web page"
            onClick={clearCustomWebPage}
            className="absolute top-4 right-4 flex items-center gap-1 text-xs font-medium text-[#78716c] hover:text-[#1a1a1a]"
          >
            <X className="size-3.5" />
            clear all
          </button>

          <h3 className="text-sm font-bold text-[#1a1a1a]">Custom Web Page</h3>

          <div className="mt-3">
            <ImageUploadField
              label="Profile Image"
              image={data.customWebPage.image}
              onChange={(dataUrl) => updateCustomWebPage("image", dataUrl)}
              className="mx-auto size-32 border-2 border-dashed border-[#d6d3d1] bg-[#f5f5f4]"
              placeholder={
                <div className="flex size-full items-center justify-center">
                  <ImageIcon className="size-8 text-[#a8a29e]" />
                </div>
              }
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#57534e]">Custom Text</label>
              <Input
                value={data.customWebPage.customText}
                onChange={(e) => updateCustomWebPage("customText", e.target.value)}
                placeholder="Enter Custom Text"
                className="h-11 rounded-lg border-[#d6d3d1] bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#57534e]">Custom Link</label>
              <Input
                value={data.customWebPage.customLink}
                onChange={(e) => updateCustomWebPage("customLink", e.target.value)}
                placeholder="https://"
                className="h-11 rounded-lg border-[#d6d3d1] bg-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeading title="WiFi Information" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#57534e]">WiFi Username/SSID</label>
              <Input
                value={data.wifi.ssid}
                onChange={(e) => updateWifi("ssid", e.target.value)}
                placeholder="Enter WiFi SSID"
                className="h-11 rounded-lg border-[#d6d3d1] bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#57534e]">WiFi Password</label>
              <Input
                value={data.wifi.password}
                onChange={(e) => updateWifi("password", e.target.value)}
                placeholder="Enter WiFi Password"
                className="h-11 rounded-lg border-[#d6d3d1] bg-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeading
            title="Platform Bypass Settings"
            description="Configure platform bypass settings for each social media platform."
          />

          <div className="space-y-3 rounded-2xl border border-[#e7e0d3] bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-[#1a1a1a]">Max Refresh Count</span>
              <div className="flex items-center gap-1 rounded-lg bg-[#f1f5f4] p-1">
                {(["1", "3"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setMaxRefreshOption(option)}
                    className={cn(
                      "rounded-md px-3 py-1 text-sm font-semibold",
                      data.platformBypass.maxRefreshOption === option
                        ? "bg-[#2dd4bf] text-white"
                        : "text-[#57534e]"
                    )}
                  >
                    {option}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setMaxRefreshOption("custom")}
                  className={cn(
                    "rounded-md px-3 py-1 text-sm font-semibold",
                    data.platformBypass.maxRefreshOption === "custom"
                      ? "bg-[#2dd4bf] text-white"
                      : "text-[#57534e]"
                  )}
                >
                  Custom
                </button>
              </div>
            </div>

            {data.platformBypass.maxRefreshOption === "custom" && (
              <Input
                type="number"
                min={0}
                value={data.platformBypass.customRefreshCount}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    platformBypass: {
                      ...prev.platformBypass,
                      customRefreshCount: e.target.value,
                    },
                  }))
                }
                placeholder="Enter custom refresh count"
                className="h-10 rounded-lg border-[#d6d3d1] bg-white"
              />
            )}

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {PLATFORM_ORDER.map((key) => (
                <ToggleRow
                  key={key}
                  label={PLATFORM_LABELS[key]}
                  checked={data.platformBypass.platforms[key]}
                  onCheckedChange={() => togglePlatformBypass(key)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeading
            title="Button Configuration"
            description="Configure the buttons that will appear on your static page."
          />

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <ToggleRow
              label="Google Copy Button"
              checked={data.buttonConfig.googleCopyButton}
              onCheckedChange={(checked) => updateButtonConfig("googleCopyButton", checked)}
            />
            <ToggleRow
              label="Ask Customer Input Details"
              checked={data.buttonConfig.askCustomerInputDetails}
              onCheckedChange={(checked) =>
                updateButtonConfig("askCustomerInputDetails", checked)
              }
            />
            <ToggleRow
              label="Upload Image Proof"
              checked={data.buttonConfig.uploadImageProof}
              onCheckedChange={(checked) => updateButtonConfig("uploadImageProof", checked)}
            />
            <ToggleRow
              label="Toggle Watermark"
              checked={data.buttonConfig.toggleWatermark}
              onCheckedChange={(checked) => updateButtonConfig("toggleWatermark", checked)}
            />
            <ToggleRow
              label="Post Switching"
              checked={data.buttonConfig.postSwitching}
              onCheckedChange={(checked) => updateButtonConfig("postSwitching", checked)}
            />
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-[#e7e0d3] bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1a1a1a]">Google Review Language Preference</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllLanguages}
                className="rounded-lg bg-[#f1f5f4] px-3 py-1.5 text-xs font-semibold text-[#1a1a1a]"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearAllLanguages}
                className="rounded-lg bg-[#1a1a1a] px-3 py-1.5 text-xs font-semibold text-white"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {(
              [
                { key: "english", label: "English" },
                { key: "chinese", label: "Chinese" },
              ] as const
            ).map((language) => (
              <label
                key={language.key}
                className="flex items-center justify-between rounded-xl bg-[#f9fafb] px-3.5 py-3"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-[#1a1a1a]">
                  <input
                    type="checkbox"
                    checked={data.languagePreference[language.key]}
                    onChange={() => toggleLanguage(language.key)}
                    className="size-4 rounded border-[#9ca3af] accent-[#2dd4bf]"
                  />
                  {language.label}
                </span>
                <span className="rounded-full bg-[#e5e7eb] px-2.5 py-0.5 text-[10px] font-semibold text-[#57534e]">
                  Available
                </span>
              </label>
            ))}
          </div>

          <p className="rounded-lg bg-[#f9fafb] px-3.5 py-2 text-xs font-medium text-[#78716c]">
            {languageSelectedCount} of 2 languages selected
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 rounded-2xl border border-[#e7e0d3] bg-white p-4 sm:grid-cols-2">
          {PLATFORM_ORDER.map((key) => (
            <ToggleRow
              key={key}
              label={PLATFORM_LABELS[key]}
              checked={data.platformVisibility[key]}
              onCheckedChange={() => togglePlatformVisibility(key)}
            />
          ))}
        </div>

        <div className="space-y-4">
          <SectionHeading title="Instructions Configuration" />

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#57534e]">Instagram Instruction</label>
              <Textarea
                value={data.instructions.instagram}
                onChange={(e) => updateInstructions("instagram", e.target.value)}
                placeholder="Write instructions for Instagram here..."
                className="min-h-16 rounded-lg border-[#d6d3d1] bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#57534e]">Tiktok Instruction</label>
              <Textarea
                value={data.instructions.tiktok}
                onChange={(e) => updateInstructions("tiktok", e.target.value)}
                placeholder="Write instructions for Tiktok here..."
                className="min-h-16 rounded-lg border-[#d6d3d1] bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#57534e]">Facebook Instruction</label>
              <Textarea
                value={data.instructions.facebook}
                onChange={(e) => updateInstructions("facebook", e.target.value)}
                placeholder="Write instructions for Facebook here..."
                className="min-h-16 rounded-lg border-[#d6d3d1] bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#57534e]">Weixin Instruction</label>
              <Textarea
                value={data.instructions.weixin}
                onChange={(e) => updateInstructions("weixin", e.target.value)}
                placeholder="Write instructions for Weixin here..."
                className="min-h-16 rounded-lg border-[#d6d3d1] bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#57534e]">Google Review Instruction</label>
              <Textarea
                value={data.instructions.googleReview}
                onChange={(e) => updateInstructions("googleReview", e.target.value)}
                placeholder="Write instructions for Google Review here..."
                className="min-h-16 rounded-lg border-[#d6d3d1] bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#57534e]">Lemon8 Instruction</label>
              <Textarea
                value={data.instructions.lemon8}
                onChange={(e) => updateInstructions("lemon8", e.target.value)}
                placeholder="Write instructions for Lemon8 here..."
                className="min-h-16 rounded-lg border-[#d6d3d1] bg-white"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="w-full rounded-xl bg-[#2dd4bf] py-3.5 text-sm font-bold text-white shadow-sm"
        >
          Save Changes
        </button>
      </div>

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />

      <BottomNav />
    </div>
  );
}
