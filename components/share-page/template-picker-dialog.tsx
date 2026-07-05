"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReviewTemplate } from "@/lib/review-templates";

type TemplatePickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: string;
  templates: ReviewTemplate[];
  onSelect: (template: ReviewTemplate) => void;
};

export function TemplatePickerDialog({
  open,
  onOpenChange,
  platform,
  templates,
  onSelect,
}: TemplatePickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="theme-force-light max-w-md p-6">
        <DialogHeader>
          <DialogTitle>Choose a review for {platform}</DialogTitle>
          <DialogDescription>
            Pick the text you&apos;d like to copy before we take you to {platform}.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template)}
              className="w-full rounded-xl border border-[#e5e7eb] p-3 text-left text-sm text-[#1a1a1a] hover:border-[#2dd4bf] hover:bg-[#2dd4bf]/5"
            >
              {template.text}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
