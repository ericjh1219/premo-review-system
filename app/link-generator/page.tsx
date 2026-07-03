import { PremiumCard } from "@/components/link-generator/premium-card";
import { LinkRow } from "@/components/link-generator/link-row";
import { QueryParametersForm } from "@/components/link-generator/query-parameters-form";
import { BottomNav } from "@/components/link-generator/bottom-nav";

export default function LinkGeneratorPage() {
  return (
    <div className="min-h-screen bg-[#daf0ed] pb-28">
      <div className="mx-auto w-full max-w-2xl px-5 pt-7 sm:px-6 sm:pt-8">
        <h1 className="text-[22px] font-bold tracking-tight text-[#1a1a1a] sm:text-[24px]">
          Welcome, Premo
        </h1>

        <div className="mt-5">
          <PremiumCard />
        </div>

        <h2 className="mt-7 text-[17px] font-bold text-[#1a1a1a]">Link Generator</h2>

        <div className="mt-3 space-y-3">
          <LinkRow
            label="Static Page Link"
            url="https://jshare.link/share/Premo/ZT68/"
          />
          <LinkRow
            label="XHS Share Link"
            url="https://jshare.link/share/Premo/1uXU"
          />
        </div>

        <div className="mt-5">
          <QueryParametersForm />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
