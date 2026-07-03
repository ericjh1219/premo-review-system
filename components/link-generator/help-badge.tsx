"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type HelpBadgeProps = {
  title: string;
  description: string;
  className?: string;
};

export function HelpBadge({ title, description, className }: HelpBadgeProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={`About ${title}`}
        onClick={() => setOpen(true)}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full bg-[#3b82f6] text-[11px] font-bold text-white",
          className
        )}
      >
        ?
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm p-6">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
