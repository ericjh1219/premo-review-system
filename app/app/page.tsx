"use client";

import { useEffect, useState } from "react";
import { PremiumCard } from "@/components/link-generator/premium-card";
import { LinkRow } from "@/components/link-generator/link-row";
import { QueryParametersForm } from "@/components/link-generator/query-parameters-form";
import { BottomNav } from "@/components/link-generator/bottom-nav";
import { Toast } from "@/components/link-generator/toast";
import { resolveBusinessId } from "@/lib/auth";
import {
  DEFAULT_LINK_GENERATOR_DATA,
  loadLinkGeneratorData,
  saveLinkGeneratorData,
  type LinkGeneratorData,
} from "@/lib/link-generator-storage";
import { DEFAULT_PROFILE_DATA, loadProfileData, type ProfileData } from "@/lib/profile-storage";

export default function LinkGeneratorPage() {
  const [links, setLinks] = useState<LinkGeneratorData>(DEFAULT_LINK_GENERATOR_DATA);
  const [locked, setLocked] = useState({ staticPageLink: true, xhsShareLink: true });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE_DATA);

  useEffect(() => {
    const businessId = resolveBusinessId();
    setLinks(loadLinkGeneratorData(businessId));
    setProfile(loadProfileData(businessId));
  }, []);

  function handleChange(key: keyof LinkGeneratorData, value: string) {
    setLinks((prev) => ({ ...prev, [key]: value }));
  }

  function handleToggleLock(key: keyof LinkGeneratorData) {
    setLocked((prev) => {
      const nextLocked = !prev[key];

      if (nextLocked) {
        setLinks((currentLinks) => {
          const businessId = resolveBusinessId();
          const persisted = loadLinkGeneratorData(businessId);
          saveLinkGeneratorData(businessId, { ...persisted, [key]: currentLinks[key] });
          return currentLinks;
        });
      }

      return { ...prev, [key]: nextLocked };
    });
  }

  async function handleCopy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setToastMessage("Link copied to clipboard.");
    } catch {
      setToastMessage("Unable to copy link.");
    }
  }

  return (
    <div className="min-h-screen bg-[#daf0ed] pb-28">
      <div className="mx-auto w-full max-w-2xl px-5 pt-7 sm:px-6 sm:pt-8">
        <h1 className="text-[22px] font-bold tracking-tight text-[#1a1a1a] sm:text-[24px]">
          Welcome, {profile.business.name || "there"}
        </h1>

        <div className="mt-5">
          <PremiumCard />
        </div>

        <h2 className="mt-7 text-[17px] font-bold text-[#1a1a1a]">Link Generator</h2>

        <div className="mt-3 space-y-3">
          <LinkRow
            label="Static Page Link"
            value={links.staticPageLink}
            locked={locked.staticPageLink}
            onToggleLock={() => handleToggleLock("staticPageLink")}
            onChange={(value) => handleChange("staticPageLink", value)}
            onCopy={() => handleCopy(links.staticPageLink)}
          />
          <LinkRow
            label="XHS Share Link"
            value={links.xhsShareLink}
            locked={locked.xhsShareLink}
            onToggleLock={() => handleToggleLock("xhsShareLink")}
            onChange={(value) => handleChange("xhsShareLink", value)}
            onCopy={() => handleCopy(links.xhsShareLink)}
          />
        </div>

        <div className="mt-5">
          <QueryParametersForm />
        </div>
      </div>

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />

      <BottomNav />
    </div>
  );
}
