"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BottomNav } from "@/components/link-generator/bottom-nav";
import { QrCodeCard } from "@/components/link-generator/qr-code-card";
import { resolveBusinessId } from "@/lib/auth";
import { DEFAULT_PROFILE_DATA, loadProfileData, type ProfileData } from "@/lib/profile-storage";
import { buildQrCodeEntries } from "@/lib/qr-codes";

export default function QrCodesPage() {
  const [businessId] = useState(resolveBusinessId);
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE_DATA);

  useEffect(() => {
    setProfile(loadProfileData(businessId));

    function refresh() {
      setProfile(loadProfileData(businessId));
    }
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [businessId]);

  const entries = buildQrCodeEntries(businessId, profile);

  return (
    <div className="min-h-screen bg-[#eef2ff] pb-28">
      <div className="mx-auto w-full max-w-2xl space-y-4 px-5 pt-6 sm:px-6 sm:pt-8">
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#57534e]"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>

        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-[#1a1a1a] sm:text-[24px]">
            QR Codes
          </h1>
          <p className="mt-1 text-sm text-[#57534e]">
            Generated automatically from {profile.business.name || "your business"}&apos;s
            profile — always up to date.
          </p>
        </div>

        <div className="space-y-3">
          {entries.map((entry) => (
            <QrCodeCard
              key={entry.id}
              label={entry.label}
              platform={entry.platform}
              value={entry.value}
            />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
