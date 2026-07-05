"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, QrCode, Star } from "lucide-react";
import { PremiumCard } from "@/components/link-generator/premium-card";
import { LinkRow } from "@/components/link-generator/link-row";
import { QueryParametersForm } from "@/components/link-generator/query-parameters-form";
import { BottomNav } from "@/components/link-generator/bottom-nav";
import { Toast } from "@/components/link-generator/toast";
import { resolveBusinessId } from "@/lib/auth";
import { getBusinessById, getEffectiveSubscriptionStatus, type Business } from "@/lib/business";
import { getSubscriptionPlan } from "@/lib/subscription-plans";
import {
  getDefaultLinkGeneratorData,
  loadLinkGeneratorData,
  saveLinkGeneratorData,
  type LinkGeneratorData,
} from "@/lib/link-generator-storage";
import { DEFAULT_PROFILE_DATA, fetchProfileData, type ProfileData } from "@/lib/profile-storage";
import { isDevelopmentAppUrl } from "@/lib/app-url";

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function LinkGeneratorPage() {
  const [businessId] = useState(resolveBusinessId);
  const [links, setLinks] = useState<LinkGeneratorData>(() =>
    getDefaultLinkGeneratorData(businessId)
  );
  const [locked, setLocked] = useState({ staticPageLink: true, xhsShareLink: true });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE_DATA);
  const [business, setBusiness] = useState<Business | undefined>(undefined);

  useEffect(() => {
    setLinks(loadLinkGeneratorData(businessId));
    fetchProfileData(businessId).then(setProfile);
    getBusinessById(businessId).then(setBusiness);
  }, [businessId]);

  const plan = business ? getSubscriptionPlan(business.subscription.plan) : null;
  const subscriptionStatus = business ? getEffectiveSubscriptionStatus(business) : "trial";

  function handleChange(key: keyof LinkGeneratorData, value: string) {
    setLinks((prev) => ({ ...prev, [key]: value }));
  }

  function handleToggleLock(key: keyof LinkGeneratorData) {
    setLocked((prev) => {
      const nextLocked = !prev[key];

      if (nextLocked) {
        setLinks((currentLinks) => {
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
          <PremiumCard
            planName={plan?.name ?? "Basic"}
            statusLabel={subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}
            dateRangeLabel={
              business
                ? `${formatShortDate(business.subscription.startDate)} - ${formatShortDate(business.subscription.expiryDate)}`
                : ""
            }
          />
        </div>

        <h2 className="mt-7 text-[17px] font-bold text-[#1a1a1a]">Link Generator</h2>

        <div className="mt-3 space-y-3">
          <LinkRow
            label="Static Page Link"
            value={links.staticPageLink}
            locked={locked.staticPageLink}
            isDevelopmentUrl={isDevelopmentAppUrl()}
            onToggleLock={() => handleToggleLock("staticPageLink")}
            onChange={(value) => handleChange("staticPageLink", value)}
            onCopy={() => handleCopy(links.staticPageLink)}
          />
          <LinkRow
            label="XHS Share Link"
            value={links.xhsShareLink}
            locked={locked.xhsShareLink}
            isDevelopmentUrl={isDevelopmentAppUrl()}
            onToggleLock={() => handleToggleLock("xhsShareLink")}
            onChange={(value) => handleChange("xhsShareLink", value)}
            onCopy={() => handleCopy(links.xhsShareLink)}
          />
        </div>

        <Link
          href="/app/qr-codes"
          className="mt-3 flex items-center justify-between rounded-2xl bg-[#0a0a0a] px-5 py-4 text-white"
        >
          <span className="flex items-center gap-2 text-sm font-bold">
            <QrCode className="size-5" />
            QR Codes
          </span>
          <ChevronRight className="size-4" />
        </Link>

        <Link
          href="/app/google-review-categories"
          className="mt-3 flex items-center justify-between rounded-2xl bg-[#0a0a0a] px-5 py-4 text-white"
        >
          <span className="flex items-center gap-2 text-sm font-bold">
            <Star className="size-5" />
            Google Review Categories
          </span>
          <ChevronRight className="size-4" />
        </Link>

        <div className="mt-5">
          <QueryParametersForm />
        </div>
      </div>

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />

      <BottomNav />
    </div>
  );
}
