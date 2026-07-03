"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TrackingEvent } from "@/lib/tracking-service";

type TrackingReportModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: TrackingEvent[];
};

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function TrackingReportModal({ open, onOpenChange, events }: TrackingReportModalProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return events;

    return events.filter((event) =>
      [event.visitorId, event.platform, event.action, event.link ?? "", event.device]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [events, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-6">
        <DialogHeader>
          <DialogTitle>Tracking Report</DialogTitle>
          <DialogDescription>
            {events.length} record{events.length === 1 ? "" : "s"} in the selected date range.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#9ca3af]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by visitor, platform, action, link, or device..."
            className="h-10 w-full rounded-lg border border-[#d1d5db] bg-white pl-9 pr-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#9ca3af]"
          />
        </div>

        <div className="mt-3 max-h-96 overflow-y-auto rounded-xl border border-[#e5e7eb]">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-[#f9fafb]">
              <tr className="text-xs text-[#6b7280]">
                <th className="px-3 py-2 font-semibold">Time</th>
                <th className="px-3 py-2 font-semibold">Visitor ID</th>
                <th className="px-3 py-2 font-semibold">Platform</th>
                <th className="px-3 py-2 font-semibold">Action</th>
                <th className="px-3 py-2 font-semibold">Link</th>
                <th className="px-3 py-2 font-semibold">Device</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-sm text-[#9ca3af]">
                    {events.length === 0
                      ? "No tracking records for the selected date range."
                      : "No records match your search."}
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="border-t border-[#f1f5f4]">
                    <td className="px-3 py-2 whitespace-nowrap text-[#1a1a1a]">
                      {formatTimestamp(event.timestamp)}
                    </td>
                    <td className="px-3 py-2 text-[#1a1a1a]">{event.visitorId}</td>
                    <td className="px-3 py-2 text-[#1a1a1a]">{event.platform}</td>
                    <td className="px-3 py-2 text-[#1a1a1a]">{event.action}</td>
                    <td className="max-w-[220px] truncate px-3 py-2 text-[#57534e]">
                      {event.link ?? "-"}
                    </td>
                    <td className="px-3 py-2 text-[#1a1a1a]">{event.device}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
