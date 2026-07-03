import { CheckCheck, Citrus, LogIn, Wifi } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineAdUnits } from "react-icons/md";
import { SiFacebook, SiInstagram, SiTiktok, SiWechat, SiXiaohongshu } from "react-icons/si";
import { BottomNav } from "@/components/link-generator/bottom-nav";
import { DateRangeFields } from "@/components/link-generator/date-range-fields";
import { EngagementChart } from "@/components/link-generator/engagement-chart";
import { EngagementSummary } from "@/components/link-generator/engagement-summary";
import { StatCard } from "@/components/link-generator/stat-card";

const stats = [
  { label: "WiFi Connect", value: 0, icon: <Wifi className="size-[18px] text-[#64748b]" /> },
  { label: "Facebook", value: 0, icon: <SiFacebook className="size-4 text-[#1877F2]" /> },
  { label: "Google Review", value: 5, icon: <FcGoogle className="size-[18px]" /> },
  { label: "Instagram Story", value: 0, icon: <SiInstagram className="size-4 text-[#E4405F]" /> },
  { label: "Rednote", value: 0, icon: <SiXiaohongshu className="size-4 text-[#f97316]" /> },
  { label: "Lemon8", value: 0, icon: <Citrus className="size-[18px] text-[#eab308]" /> },
  { label: "TikTok", value: 0, icon: <SiTiktok className="size-4 text-[#1a1a1a]" /> },
  { label: "Weixin", value: 0, icon: <SiWechat className="size-4 text-[#22c55e]" /> },
  { label: "Facebook Follow", value: 0, icon: <SiFacebook className="size-4 text-[#1877F2]" /> },
  { label: "Instagram Follow", value: 0, icon: <SiInstagram className="size-4 text-[#E4405F]" /> },
  { label: "Tiktok Follow", value: 0, icon: <SiTiktok className="size-4 text-[#1a1a1a]" /> },
  { label: "Lemon8 Follow", value: 0, icon: <Citrus className="size-[18px] text-[#eab308]" /> },
  { label: "XHS Follow", value: 0, icon: <SiXiaohongshu className="size-4 text-[#f97316]" /> },
  { label: "Custom Webpage", value: 0, icon: <MdOutlineAdUnits className="size-[18px] text-[#f97316]" /> },
  { label: "Upload Proof", value: 0, icon: <CheckCheck className="size-[18px] text-[#ef4444]" /> },
];

const totalClicks = stats.reduce((sum, stat) => sum + stat.value, 0);
const topStat = stats.reduce((top, stat) => (stat.value > top.value ? stat : top), stats[0]);

export default function LinkGeneratorDashboardPage() {
  return (
    <div className="min-h-screen bg-[#e9e9ee] pb-28">
      <div className="mx-auto w-full max-w-2xl space-y-4 px-5 pt-6 sm:px-6 sm:pt-8">
        <DateRangeFields />

        <StatCard
          label="Page Entry"
          value={6}
          icon={<LogIn className="size-5 text-[#16a34a]" />}
          className="p-4"
          labelClassName="text-sm"
          valueClassName="text-2xl"
          corner={
            <span className="flex size-5 items-center justify-center rounded-full bg-[#3b82f6] text-[11px] font-bold text-white">
              ?
            </span>
          }
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
          ))}
        </div>

        <EngagementChart data={stats.map(({ label, value }) => ({ name: label, value }))} />

        <EngagementSummary
          totalClicks={totalClicks}
          topPlatform={topStat.label}
          topPlatformClicks={topStat.value}
        />

        <div className="space-y-3">
          <button
            type="button"
            className="w-full rounded-xl bg-[#3554d6] py-3.5 text-[15px] font-semibold text-white shadow-sm"
          >
            Show Tracking Report
          </button>
          <button
            type="button"
            className="w-full rounded-xl bg-[#3f63e6] py-3.5 text-[15px] font-semibold text-white shadow-sm"
          >
            Show Lucky Draw Participant Report
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
