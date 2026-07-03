type DateRangeFieldsProps = {
  startTime?: string;
  endTime?: string;
};

export function DateRangeFields({
  startTime = "2026-06-25T20:49",
  endTime = "2026-07-02T20:49",
}: DateRangeFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-[13px] font-medium text-[#374151]">Start Time</label>
        <input
          type="datetime-local"
          defaultValue={startTime}
          className="mt-1.5 h-11 w-full rounded-lg border border-[#d1d5db] bg-white px-3 text-[13px] text-[#111827] outline-none"
        />
      </div>
      <div>
        <label className="text-[13px] font-medium text-[#374151]">End Time</label>
        <input
          type="datetime-local"
          defaultValue={endTime}
          className="mt-1.5 h-11 w-full rounded-lg border border-[#d1d5db] bg-white px-3 text-[13px] text-[#111827] outline-none"
        />
      </div>
    </div>
  );
}
