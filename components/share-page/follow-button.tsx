"use client";

import { PlatformIcon } from "@/components/share-page/platform-icon";

type FollowButtonProps = {
  platform: string;
  label: string;
  onClick: () => void;
};

export function FollowButton({ platform, label, onClick }: FollowButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-xl bg-[#0a0a0a] px-3 py-3"
    >
      <PlatformIcon platform={platform} size="sm" />
      <span className="text-sm font-semibold text-white">{label}</span>
    </button>
  );
}
