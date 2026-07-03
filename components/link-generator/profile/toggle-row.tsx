"use client";

import { Switch } from "@/components/ui/switch";

type ToggleRowProps = {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function ToggleRow({ label, checked, onCheckedChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#f9fafb] px-3.5 py-3">
      <span className="text-sm font-medium text-[#1a1a1a]">{label}</span>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-checked:bg-[#2dd4bf]"
      />
    </div>
  );
}
