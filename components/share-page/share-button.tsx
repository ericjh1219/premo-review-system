"use client";

import { MoreHorizontal } from "lucide-react";
import { PlatformIcon } from "@/components/share-page/platform-icon";

type ShareButtonProps = {
  platform: string;
  label: string;
  hasMultipleTemplates: boolean;
  onClick: () => void;
  onMoreClick: () => void;
};

export function ShareButton({
  platform,
  label,
  hasMultipleTemplates,
  onClick,
  onMoreClick,
}: ShareButtonProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#0a0a0a] p-3">
      <PlatformIcon platform={platform} size="lg" />
      <button
        type="button"
        onClick={onClick}
        className="flex-1 text-center text-base font-bold text-white"
      >
        {label}
      </button>
      {hasMultipleTemplates && (
        <button
          type="button"
          aria-label={`Choose a template for ${label}`}
          onClick={onMoreClick}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-black"
        >
          <MoreHorizontal className="size-4" />
        </button>
      )}
    </div>
  );
}
