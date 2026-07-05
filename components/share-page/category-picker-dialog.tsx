"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GoogleReviewCategory } from "@/lib/review-categories";

type CategoryPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: GoogleReviewCategory[];
  onSelect: (category: GoogleReviewCategory) => void;
};

export function CategoryPickerDialog({
  open,
  onOpenChange,
  categories,
  onSelect,
}: CategoryPickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="theme-force-light max-w-md p-6">
        <DialogHeader>
          <DialogTitle>Choose a category</DialogTitle>
          <DialogDescription>
            Pick the category that best matches your visit to see the right reviews to choose
            from.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category)}
              className="w-full rounded-xl border border-[#e5e7eb] p-3 text-left text-sm text-[#1a1a1a] hover:border-[#2dd4bf] hover:bg-[#2dd4bf]/5"
            >
              {category.name}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
