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
import type { LuckyDrawParticipant, LuckyDrawStatus } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

type LuckyDrawReportModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participants: LuckyDrawParticipant[];
};

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const STATUS_STYLES: Record<LuckyDrawStatus, string> = {
  Winner: "bg-emerald-500/10 text-emerald-700",
  Pending: "bg-amber-500/10 text-amber-700",
  "Not Selected": "bg-zinc-500/10 text-zinc-500",
};

export function LuckyDrawReportModal({
  open,
  onOpenChange,
  participants,
}: LuckyDrawReportModalProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  const filteredParticipants = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return participants;

    return participants.filter((participant) =>
      [participant.name, participant.phone, participant.email, participant.status]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [participants, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-6">
        <DialogHeader>
          <DialogTitle>Lucky Draw Participant Report</DialogTitle>
          <DialogDescription>
            {participants.length} participant{participants.length === 1 ? "" : "s"} in the
            selected date range.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#9ca3af]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, phone, email, or status..."
            className="h-10 w-full rounded-lg border border-[#d1d5db] bg-white pl-9 pr-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#9ca3af]"
          />
        </div>

        <div className="mt-3 max-h-96 overflow-y-auto rounded-xl border border-[#e5e7eb]">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-[#f9fafb]">
              <tr className="text-xs text-[#6b7280]">
                <th className="px-3 py-2 font-semibold">Name</th>
                <th className="px-3 py-2 font-semibold">Phone</th>
                <th className="px-3 py-2 font-semibold">Email</th>
                <th className="px-3 py-2 font-semibold">Submission Time</th>
                <th className="px-3 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center text-sm text-[#9ca3af]">
                    {participants.length === 0
                      ? "No lucky draw participants for the selected date range."
                      : "No participants match your search."}
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((participant) => (
                  <tr key={participant.id} className="border-t border-[#f1f5f4]">
                    <td className="px-3 py-2 font-medium whitespace-nowrap text-[#1a1a1a]">
                      {participant.name}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-[#1a1a1a]">
                      {participant.phone}
                    </td>
                    <td className="px-3 py-2 text-[#57534e]">{participant.email}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-[#1a1a1a]">
                      {formatTimestamp(participant.submittedAt)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          STATUS_STYLES[participant.status]
                        )}
                      >
                        {participant.status}
                      </span>
                    </td>
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
