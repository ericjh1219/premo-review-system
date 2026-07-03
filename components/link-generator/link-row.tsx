import { Copy, Lock, QrCode } from "lucide-react";

type LinkRowProps = {
  label: string;
  url: string;
};

export function LinkRow({ label, url }: LinkRowProps) {
  return (
    <div className="rounded-2xl bg-[#b8e4df] px-4 py-3.5">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[13px] font-semibold text-[#1a1a1a]">{label}</span>
        <Lock className="size-3.5 text-[#1a1a1a]/70" />
        <button type="button" aria-label={`Copy ${label}`} className="text-[#1a1a1a]/70">
          <Copy className="size-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={url}
          className="h-9 min-w-0 flex-1 rounded-lg border border-[#1a1a1a] bg-[#fef08a] px-3 text-[12px] text-[#1a1a1a] outline-none"
        />
        <button
          type="button"
          aria-label={`QR code for ${label}`}
          className="flex size-8 shrink-0 items-center justify-center text-[#1a1a1a]"
        >
          <QrCode className="size-5" />
        </button>
      </div>
    </div>
  );
}
