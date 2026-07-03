type EngagementSummaryProps = {
  totalClicks: number;
  topPlatform: string;
  topPlatformClicks: number;
};

export function EngagementSummary({
  totalClicks,
  topPlatform,
  topPlatformClicks,
}: EngagementSummaryProps) {
  return (
    <div className="rounded-2xl bg-[#eaf1fd] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[13px] text-[#3b5bdb]">
            Total Engagement Across All Social Media
            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#3b82f6] text-[10px] font-bold text-white">
              ?
            </span>
          </div>
          <p className="mt-1 text-2xl font-bold text-[#1e293b]">{totalClicks} clicks</p>
        </div>
        <div className="text-right">
          <p className="text-[13px] text-[#3b5bdb]">Top Platform</p>
          <p className="mt-1 text-base font-bold text-[#1e3a8a]">
            {topPlatform} ({topPlatformClicks} clicks)
          </p>
        </div>
      </div>
    </div>
  );
}
