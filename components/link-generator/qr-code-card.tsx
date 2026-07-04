"use client";

import { useRef, useState } from "react";
import { Check, Copy, Download, Eye, EyeOff } from "lucide-react";
import QRCode from "react-qr-code";
import { PlatformIcon } from "@/components/share-page/platform-icon";
import { cn } from "@/lib/utils";

type QrCodeCardProps = {
  label: string;
  platform: string;
  value: string;
};

function slugify(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function triggerDownload(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const actionButtonClassName =
  "flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#f1f5f4] py-2 text-xs font-semibold text-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-40";

export function QrCodeCard({ label, platform, value }: QrCodeCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrWrapperRef = useRef<HTMLDivElement>(null);

  const configured = value.trim().length > 0;

  function getSvgElement() {
    return qrWrapperRef.current?.querySelector("svg") ?? null;
  }

  function handleDownloadSvg() {
    const svg = getSvgElement();
    if (!svg) return;

    const serialized = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([serialized], { type: "image/svg+xml" });
    triggerDownload(URL.createObjectURL(blob), `${slugify(label)}-qr.svg`);
  }

  function handleDownloadPng() {
    const svg = getSvgElement();
    if (!svg) return;

    const serialized = new XMLSerializer().serializeToString(svg);
    const svgUrl = URL.createObjectURL(new Blob([serialized], { type: "image/svg+xml" }));
    const image = new Image();

    image.onload = () => {
      const size = 512;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const context = canvas.getContext("2d");
      if (context) {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, size, size);
        context.drawImage(image, 0, 0, size, size);
      }
      URL.revokeObjectURL(svgUrl);

      canvas.toBlob((blob) => {
        if (blob) triggerDownload(URL.createObjectURL(blob), `${slugify(label)}-qr.png`);
      }, "image/png");
    };
    image.src = svgUrl;
  }

  async function handleCopy() {
    if (!configured) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard write failed silently — nothing else to do here.
    }
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <PlatformIcon
          platform={platform}
          size="sm"
          className={platform === "WiFi Connect" ? "bg-[#334155]" : undefined}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#1a1a1a]">{label}</p>
          <p className="truncate text-xs text-[#78716c]">
            {configured ? value : "Not configured yet — set this up in your Profile."}
          </p>
        </div>
      </div>

      {configured && (
        <div
          ref={qrWrapperRef}
          className={cn(
            "justify-center rounded-lg bg-white p-3",
            showPreview ? "mt-3 flex" : "hidden"
          )}
        >
          <QRCode value={value} size={160} />
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={!configured}
          onClick={() => setShowPreview((prev) => !prev)}
          className={actionButtonClassName}
        >
          {showPreview ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          Preview
        </button>
        <button
          type="button"
          disabled={!configured}
          onClick={handleDownloadPng}
          className={actionButtonClassName}
        >
          <Download className="size-3.5" />
          PNG
        </button>
        <button
          type="button"
          disabled={!configured}
          onClick={handleDownloadSvg}
          className={actionButtonClassName}
        >
          <Download className="size-3.5" />
          SVG
        </button>
        <button
          type="button"
          disabled={!configured}
          onClick={handleCopy}
          className={actionButtonClassName}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}
