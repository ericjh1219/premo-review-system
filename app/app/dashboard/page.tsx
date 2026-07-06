"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, Citrus, LogIn, LogOut, Wifi } from "lucide-react";
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
import { getAuthenticatedAdmin, logout, resolveBusinessId } from "@/lib/auth";
import type { AdminUser } from "@/lib/admin";
import { getMockLuckyDrawParticipants, PLATFORM_OPTIONS } from "@/lib/dashboard-data";
import { DEFAULT_PROFILE_DATA, fetchProfileData, type ProfileData } from "@/lib/profile-storage";
import { trackingService } from "@/lib/tracking-service";

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

function toLocalInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function defaultStart() {
  return toLocalInputValue(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
}

function defaultEnd() {
  return toLocalInputValue(new Date());
}

export default function LinkGeneratorDashboardPage() {
  const router = useRouter();
  const [businessId] = useState(resolveBusinessId);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [luckyDrawOpen, setLuckyDrawOpen] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE_DATA);

  useEffect(() => {
    function refresh() {
      setRefreshTick((tick) => tick + 1);
    }
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchProfileData(businessId).then((loaded) => {
      if (!cancelled) setProfile(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [businessId, refreshTick]);

  useEffect(() => {
    getAuthenticatedAdmin().then(setCurrentAdmin);
  }, []);

  const rangeStart = startTime ? new Date(startTime).getTime() : -Infinity;
  const rangeEnd = endTime ? new Date(endTime).getTime() : Infinity;

  const filteredEvents = useMemo(() => {
    return trackingService.getEventsInRange(businessId, rangeStart, rangeEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, rangeStart, rangeEnd, refreshTick]);

  const filteredParticipants = useMemo(() => {
    return getMockLuckyDrawParticipants(businessId).filter((participant) => {
      const time = new Date(participant.submittedAt).getTime();
      return time >= rangeStart && time <= rangeEnd;
    });
  }, [businessId, rangeStart, rangeEnd]);

  const pageEntryCount = useMemo(
    () => filteredEvents.filter((event) => event.platform === "Page Entry").length,
    [filteredEvents]
  );

  const stats = useMemo(
    () =>
      PLATFORM_OPTIONS.map((label) => ({
        label,
        value: filteredEvents.filter((event) => event.platform === label).length,
        icon: PLATFORM_ICONS[label],
      })),
    [filteredEvents]
  );

  const totalClicks = stats.reduce((sum, stat) => sum + stat.value, 0);
  const topStat = stats.reduce((top, stat) => (stat.value > top.value ? stat : top), stats[0]);
  const topPlatformLabel = topStat.value > 0 ? topStat.label : "No engagement yet";

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#e9e9ee] pb-28">
      <div className="mx-auto w-full max-w-2xl space-y-4 px-5 pt-6 sm:px-6 sm:pt-8">
        {currentAdmin && (
          <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
            <div>
              <p className="text-sm font-bold text-[#1a1a1a]">{currentAdmin.name}</p>
              <p className="text-xs text-[#78716c]">
                {currentAdmin.role}
                {profile.business.name ? ` · ${profile.business.name}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-[#78716c] hover:bg-[#f1f5f4] hover:text-[#1a1a1a]"
            >
              <LogOut className="size-4" />
              Log out
            </button>
          </div>
        )}

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
