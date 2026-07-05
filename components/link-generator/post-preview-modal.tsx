"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlatformIcon } from "@/components/link-generator/platform-icon";

type PostPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  socialPlatform: string;
  title: string;
  description: string;
  batch: string;
  mediaTab: "images" | "video";
  imageFiles: File[];
  imageLinks: string;
  videoFile: File | null;
  videoLink: string;
  onConfirm: () => void;
  confirmLabel?: string;
};

export function PostPreviewModal({
  open,
  onOpenChange,
  socialPlatform,
  title,
  description,
  batch,
  imageFiles,
  imageLinks,
  videoFile,
  videoLink,
  onConfirm,
  confirmLabel = "Create Post",
}: PostPreviewModalProps) {
  const [imageObjectUrls, setImageObjectUrls] = useState<string[]>([]);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const urls = imageFiles.map((file) => URL.createObjectURL(file));
    setImageObjectUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [imageFiles]);

  useEffect(() => {
    if (!videoFile) {
      setVideoObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(videoFile);
    setVideoObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  const linkedImages = imageLinks
    .split(",")
    .map((link) => link.trim())
    .filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="theme-force-light max-w-lg p-6">
        <DialogHeader>
          <DialogTitle>Preview</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4 rounded-xl border border-[#e5e7eb] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-[#1a1a1a]">
              <PlatformIcon platform={socialPlatform} />
              {socialPlatform}
            </div>
            <span className="rounded-full bg-[#f1f5f4] px-2.5 py-0.5 text-xs font-medium text-[#57534e]">
              {batch.trim() || "Unassigned"}
            </span>
          </div>

          <div>
            <p className="font-semibold text-[#1a1a1a]">{title.trim() || "Untitled post"}</p>
            {description.trim() && (
              <p className="mt-1 text-sm whitespace-pre-wrap text-[#57534e]">{description}</p>
            )}
          </div>

          {videoObjectUrl ? (
            <video controls src={videoObjectUrl} className="w-full rounded-lg" />
          ) : videoLink.trim() ? (
            <p className="truncate rounded-lg bg-[#f1f5f4] px-3 py-2 text-xs text-[#57534e]">
              Video: {videoLink.trim()}
            </p>
          ) : null}

          {(imageObjectUrls.length > 0 || linkedImages.length > 0) && (
            <div className="grid grid-cols-3 gap-2">
              {imageObjectUrls.map((url, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="aspect-square w-full rounded-lg object-cover"
                />
              ))}
              {linkedImages.map((link) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={link}
                  src={link}
                  alt="Linked image"
                  className="aspect-square w-full rounded-lg border border-[#e5e7eb] object-cover"
                />
              ))}
            </div>
          )}

          {imageObjectUrls.length === 0 &&
            linkedImages.length === 0 &&
            !videoObjectUrl &&
            !videoLink.trim() && <p className="text-sm text-[#9ca3af]">No media attached.</p>}
        </div>

        <DialogFooter className="mt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-[#d1d5db] px-4 py-2 text-sm font-semibold text-[#1a1a1a]"
          >
            Back to Edit
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-[#facc15] px-4 py-2 text-sm font-semibold text-[#1a1a1a]"
          >
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
