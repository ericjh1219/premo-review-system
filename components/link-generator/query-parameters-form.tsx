"use client";

import { ColoredInput } from "@/components/link-generator/colored-input";
import { Button } from "@/components/ui/button";

const platformFields = [
  { placeholder: "Enter rednote id (optional)", accent: "bg-[#ef4444]" },
  { placeholder: "Enter tiktok id (optional)", accent: "bg-[#1a1a1a]" },
  { placeholder: "Enter instagram story id (optional)", accent: "bg-[#a855f7]" },
  { placeholder: "Enter google review id (optional)", accent: "bg-[#38bdf8]" },
  { placeholder: "Enter facebook id (optional)", accent: "bg-[#2563eb]" },
  { placeholder: "Enter wechat id (optional)", accent: "bg-[#22c55e]" },
  { placeholder: "Enter lemon8 id (optional)", accent: "bg-[#eab308]" },
];

export function QueryParametersForm() {
  return (
    <div className="rounded-2xl bg-[#8ecbc4] px-5 py-5 shadow-sm">
      <h3 className="text-[15px] font-bold text-[#1e4d47]">Query Parameters Guide</h3>
      <p className="mt-1 text-[11px] text-[#1e4d47]/75">
        Social Platform IDs (Optional - Numbers Only)
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {platformFields.map((field) => (
          <ColoredInput
            key={field.placeholder}
            placeholder={field.placeholder}
            accentColor={field.accent}
          />
        ))}
      </div>

      <p className="mt-5 text-[11px] font-medium text-[#1e4d47]/75">
        Auto-fill Parameters (Optional)
      </p>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ColoredInput
          placeholder="Enter customer name (optional)"
          accentColor="bg-[#38bdf8]"
        />
        <ColoredInput
          placeholder="+1234567890 (optional)"
          accentColor="bg-[#5eead4]"
          type="tel"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          type="button"
          className="h-10 rounded-xl bg-[#4ecdc4] text-[13px] font-semibold text-white shadow-sm hover:bg-[#45bab3]"
        >
          Generate &amp; Copy Link
        </Button>
        <Button
          type="button"
          className="h-10 rounded-xl bg-[#718096] text-[13px] font-semibold text-white shadow-sm hover:bg-[#657489]"
        >
          Reset Form
        </Button>
      </div>
    </div>
  );
}
