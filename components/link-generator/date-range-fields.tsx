"use client";

type DateRangeFieldsProps = {
  startTime: string;
  endTime: string;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
};

export function DateRangeFields({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}: DateRangeFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-[13px] font-medium text-[#374151]">Start Time</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(event) => onStartTimeChange(event.target.value)}
          className="mt-1.5 h-11 w-full rounded-lg border border-[#d1d5db] bg-white px-3 text-[13px] text-[#111827] outline-none"
        />
      </div>
      <div>
        <label className="text-[13px] font-medium text-[#374151]">End Time</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(event) => onEndTimeChange(event.target.value)}
          className="mt-1.5 h-11 w-full rounded-lg border border-[#d1d5db] bg-white px-3 text-[13px] text-[#111827] outline-none"
        />
      </div>
    </div>
  );
}
