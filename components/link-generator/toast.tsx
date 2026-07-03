"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

type ToastProps = {
  message: string | null;
  onDismiss: () => void;
  durationMs?: number;
};

export function Toast({ message, onDismiss, durationMs = 3500 }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs, onDismiss]);

  if (!message) return null;

  return (
    <div className="fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4">
      <div className="flex items-center gap-2 rounded-full bg-[#1a1a1a] px-5 py-3 text-sm font-medium text-white shadow-lg">
        <CheckCircle2 className="size-4 text-emerald-400" />
        {message}
      </div>
    </div>
  );
}
