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

export function ImageUploadField({
  label,
  image,
  onChange,
  placeholder,
  className,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onChange(String(reader.result ?? ""));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
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
