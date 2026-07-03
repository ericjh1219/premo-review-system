import { Check } from "lucide-react";

export function PremiumCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#1a1a1a] px-6 py-5 shadow-md">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_50%,rgba(139,30,30,0.85)_0%,rgba(60,15,15,0.4)_45%,transparent_70%)]" />
      <div className="relative">
        <div className="flex items-center gap-3">
          <h2 className="text-[28px] font-bold tracking-tight text-white">Premium</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-[#1a1a1a]">
            <Check className="size-3 stroke-[3]" />
            Active
          </span>
        </div>
        <p className="mt-1 text-[13px] font-medium text-[#f59e0b]">
          Premium post management service
        </p>
        <p className="mt-3 text-[12px] text-white/55">02 Sep 2025 - 02 Sep 2026</p>
      </div>
    </div>
  );
}
