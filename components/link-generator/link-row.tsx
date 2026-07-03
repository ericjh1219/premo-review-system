"use client";

import { useState } from "react";
import { Copy, Lock, QrCode, Unlock } from "lucide-react";
import QRCode from "react-qr-code";
import { cn } from "@/lib/utils";

type LinkRowProps = {
  label: string;
  value: string;
  locked: boolean;
  onToggleLock: () => void;
  onChange: (value: string) => void;
  onCopy: () => void;
};

export function LinkRow({ label, value, locked, onToggleLock, onChange, onCopy }: LinkRowProps) {
  const [showQr, setShowQr] = useState(false);

  return (
    <div className="rounded-2xl bg-[#b8e4df] px-4 py-3.5">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[13px] font-semibold text-[#1a1a1a]">{label}</span>
        <button
          type="button"
          aria-label={locked ? `Unlock ${label}` : `Lock and save ${label}`}
          onClick={onToggleLock}
          className="text-[#1a1a1a]/70"
        >
          {locked ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
        </button>
        <button
          type="button"
          aria-label={`Copy ${label}`}
          onClick={onCopy}
          className="text-[#1a1a1a]/70"
        >
          <Copy className="size-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          readOnly={locked}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-9 min-w-0 flex-1 rounded-lg border border-[#1a1a1a] bg-[#fef08a] px-3 text-[12px] text-[#1a1a1a] outline-none",
            locked && "cursor-default"
          )}
        />
        <button
          type="button"
          aria-label={`QR code for ${label}`}
          onClick={() => setShowQr((prev) => !prev)}
          className="flex size-8 shrink-0 items-center justify-center text-[#1a1a1a]"
        >
          <QrCode className="size-5" />
        </button>
      </div>

      {showQr && (
        <div className="mt-3 flex justify-center rounded-lg bg-white p-3">
          <QRCode value={value || " "} size={128} />
        </div>
      )}
    </div>
  );
}
