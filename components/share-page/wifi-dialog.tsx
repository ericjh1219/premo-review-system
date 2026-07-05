"use client";

import { Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type WifiDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ssid: string;
  password: string;
  onCopyPassword: () => void;
};

export function WifiDialog({ open, onOpenChange, ssid, password, onCopyPassword }: WifiDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="theme-force-light max-w-sm p-6">
        <DialogHeader>
          <DialogTitle>Connect to WiFi</DialogTitle>
          <DialogDescription>Use these details to join our network.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-[#78716c]">Network Name</p>
            <p className="mt-0.5 text-sm font-semibold text-[#1a1a1a]">{ssid}</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#78716c]">Password</p>
              <p className="mt-0.5 text-sm font-semibold text-[#1a1a1a]">{password}</p>
            </div>
            <button
              type="button"
              onClick={onCopyPassword}
              aria-label="Copy WiFi password"
              className="flex size-9 items-center justify-center rounded-lg border border-[#d1d5db] text-[#1a1a1a]"
            >
              <Copy className="size-4" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
