"use client";

import { useRef } from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

type ImageUploadFieldProps = {
  label: string;
  image: string | null;
  onChange: (dataUrl: string) => void;
  placeholder: React.ReactNode;
  className?: string;
};

const MAX_IMAGE_DIMENSION = 800;
const IMAGE_QUALITY = 0.8;

/**
 * Downscales the image and re-encodes it as JPEG before it's stored as a
 * data URL. Raw phone photos can be several MB each — storing three of them
 * (profile, background, custom web page) uncompressed easily exceeds the
 * localStorage quota and throws, which silently breaks the entire Profile
 * save (not just the image field). Always resolves, falling back to the
 * original data URL if the image can't be decoded/redrawn.
 */
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const original = String(reader.result ?? "");
      const image = new Image();

      image.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height));
        const width = Math.round(image.width * scale) || image.width;
        const height = Math.round(image.height * scale) || image.height;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(original);
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", IMAGE_QUALITY));
      };
      image.onerror = () => resolve(original);
      image.src = original;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

export function ImageUploadField({
  label,
  image,
  onChange,
  placeholder,
  className,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const dataUrl = await resizeImage(file);
    if (dataUrl) onChange(dataUrl);
  }

  return (
    <div>
      <p className="text-sm font-medium text-[#57534e]">{label}</p>
      <div className={cn("relative mt-2 size-24 overflow-hidden rounded-xl", className)}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={label} className="size-full object-cover" />
        ) : (
          placeholder
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          aria-label={`Upload ${label}`}
          onClick={() => inputRef.current?.click()}
          className="absolute right-1 bottom-1 flex size-6 items-center justify-center rounded-md bg-[#2dd4bf] text-white shadow-sm"
        >
          <Pencil className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
