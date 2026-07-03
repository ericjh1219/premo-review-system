"use client";

import { useMemo, useState, type ReactNode } from "react";
import { CheckCheck, Citrus, LogIn, Wifi } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { MdOutlineAdUnits } from "react-icons/md";
import { SiFacebook, SiInstagram, SiTiktok, SiWechat, SiXiaohongshu } from "react-icons/si";
import { BottomNav } from "@/components/link-generator/bottom-nav";
import { DateRangeFields } from "@/components/link-generator/date-range-fields";
import { EngagementChart } from "@/components/link-generator/engagement-chart";
import { EngagementSummary } from "@/components/link-generator/engagement-summary";
import { HelpBadge } from "@/components/link-generator/help-badge";
import { LuckyDrawReportModal } from "@/components/link-generator/lucky-draw-report-modal";
import { StatCard } from "@/components/link-generator/stat-card";
import { TrackingReportModal } from "@/components/link-generator/tracking-report-modal";
import {
  MOCK_LUCKY_DRAW_PARTICIPANTS,
  MOCK_TRACKING_EVENTS,
  PLATFORM_OPTIONS,
} from "@/lib/dashboard-data";

const PLATFORM_ICONS: Record<string, ReactNode> = {
  "WiFi Connect": <Wifi className="size-[18px] text-[#64748b]" />,
  Facebook: <SiFacebook className="size-4 text-[#1877F2]" />,
  "Google Review": <FcGoogle className="size-[18px]" />,
  "Instagram Story": <SiInstagram className="size-4 text-[#E4405F]" />,
  Rednote: <SiXiaohongshu className="size-4 text-[#f97316]" />,
  Lemon8: <Citrus className="size-[18px] text-[#eab308]" />,
  TikTok: <SiTiktok className="size-4 text-[#1a1a1a]" />,
  Weixin: <SiWechat className="size-4 text-[#22c55e]" />,
  "Facebook Follow": <SiFacebook className="size-4 text-[#1877F2]" />,
  "Instagram Follow": <SiInstagram className="size-4 text-[#E4405F]" />,
  "Tiktok Follow": <SiTiktok className="size-4 text-[#1a1a1a]" />,
  "Lemon8 Follow": <Citrus className="size-[18px] text-[#eab308]" />,
  "XHS Follow": <SiXiaohongshu className="size-4 text-[#f97316]" />,
  "Custom Webpage": <MdOutlineAdUnits className="size-[18px] text-[#f97316]" />,
  "Upload Proof": <CheckCheck className="size-[18px] text-[#ef4444]" />,
};

const DEFAULT_START = "2026-06-25T20:49";
const DEFAULT_END = "2026-07-02T20:49";

export default function LinkGeneratorDashboardPage() {
  const [startTime, setStartTime] = useState(DEFAULT_START);
  const [endTime, setEndTime] = useState(DEFAULT_END);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [luckyDrawOpen, setLuckyDrawOpen] = useState(false);

  const rangeStart = startTime ? new Date(startTime).getTime() : -Infinity;
  const rangeEnd = endTime ? new Date(endTime).getTime() : Infinity;

  const filteredEvents = useMemo(() => {
    return MOCK_TRACKING_EVENTS.filter((event) => {
      const time = new Date(event.timestamp).getTime();
      return time >= rangeStart && time <= rangeEnd;
    });
  }, [rangeStart, rangeEnd]);

  const filteredParticipants = useMemo(() => {
    return MOCK_LUCKY_DRAW_PARTICIPANTS.filter((participant) => {
      const time = new Date(participant.submittedAt).getTime();
      return time >= rangeStart && time <= rangeEnd;
    });
  }, [rangeStart, rangeEnd]);

  const pageEntryCount = useMemo(
    () => filteredEvents.filter((event) => event.action === "Page Entry").length,
    [filteredEvents]
  );

  const stats = useMemo(
    () =>
      PLATFORM_OPTIONS.map((label) => ({
        label,
        value: filteredEvents.filter(
          (event) => event.action === "Click" && event.platform === label
        ).length,
        icon: PLATFORM_ICONS[label],
      })),
    [filteredEvents]
  );

  const totalClicks = stats.reduce((sum, stat) => sum + stat.value, 0);
  const topStat = stats.reduce((top, stat) => (stat.value > top.value ? stat : top), stats[0]);
  const topPlatformLabel = topStat.value > 0 ? topStat.label : "No engagement yet";

  return (
    <div className="min-h-screen bg-[#e9e9ee] pb-28">
      <div className="mx-auto w-full max-w-2xl space-y-4 px-5 pt-6 sm:px-6 sm:pt-8">
        <DateRangeFields
          startTime={startTime}
          endTime={endTime}
          onStartTimeChange={setStartTime}
          onEndTimeChange={setEndTime}
        />

        <StatCard
          label="Page Entry"
          value={pageEntryCount}
          icon={<LogIn className="size-5 text-[#16a34a]" />}
          className="p-4"
          labelClassName="text-sm"
          valueClassName="text-2xl"
          corner={
            <HelpBadge
              title="Page Entry"
              description="The number of times visitors opened your page during the selected date range."
            />
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
          topPlatform={topPlatformLabel}
          topPlatformClicks={topStat.value}
        />

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setTrackingOpen(true)}
            className="w-full rounded-xl bg-[#3554d6] py-3.5 text-[15px] font-semibold text-white shadow-sm"
          >
            Show Tracking Report
          </button>
          <button
            type="button"
            onClick={() => setLuckyDrawOpen(true)}
            className="w-full rounded-xl bg-[#3f63e6] py-3.5 text-[15px] font-semibold text-white shadow-sm"
          >
            Show Lucky Draw Participant Report
          </button>
        </div>
      </div>

      <TrackingReportModal
        open={trackingOpen}
        onOpenChange={setTrackingOpen}
        events={filteredEvents}
      />
      <LuckyDrawReportModal
        open={luckyDrawOpen}
        onOpenChange={setLuckyDrawOpen}
        participants={filteredParticipants}
      />

      <BottomNav />
    </div>
  );
}
