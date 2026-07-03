"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { NewPostInput } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type SheetsImportPanelProps = {
  onImport: (posts: NewPostInput[]) => void;
};

const fieldClassName = "h-12 rounded-lg border-[#d1d5db] text-base";

const MOCK_SHEET_ROWS: NewPostInput[] = [
  {
    title: "Autumn menu spotlight",
    description: "Featuring our new autumn seasonal dishes.",
    socialPlatform: "Instagram",
    batch: "Batch #6",
    hasVideo: true,
    imageCount: 0,
  },
  {
    title: "Customer loyalty shoutout",
    description: "Thanking our most loyal customers this month.",
    socialPlatform: "Facebook",
    batch: "Batch #6",
    hasVideo: false,
    imageCount: 3,
  },
  {
    title: "Rednote engagement boost",
    description: "Cross-posting our top review highlights.",
    socialPlatform: "Rednote",
    batch: "Batch #6",
    hasVideo: false,
    imageCount: 2,
  },
  {
    title: "Weekly TikTok trend recap",
    description: "Recapping this week's top-performing trend.",
    socialPlatform: "TikTok",
    batch: "Batch #6",
    hasVideo: true,
    imageCount: 0,
  },
];

export function SheetsImportPanel({ onImport }: SheetsImportPanelProps) {
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [deleteAfterImport, setDeleteAfterImport] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [previewRows, setPreviewRows] = useState<NewPostInput[] | null>(null);

  const canFetch = spreadsheetId.trim().length > 0 && sheetName.trim().length > 0;

  function handleFetchPreview() {
    if (!canFetch) return;
    setIsFetching(true);
    setTimeout(() => {
      setPreviewRows(MOCK_SHEET_ROWS);
      setIsFetching(false);
    }, 500);
  }

  function handleConfirmImport() {
    if (!previewRows) return;
    onImport(previewRows);
    setPreviewRows(null);
    setSpreadsheetId("");
    setSheetName("");
    setDeleteAfterImport(false);
  }

  return (
    <div className="mt-5 space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="sheet-spreadsheet-id" className="text-sm font-semibold text-[#1a1a1a]">
          Spreadsheet ID
        </Label>
        <Input
          id="sheet-spreadsheet-id"
          value={spreadsheetId}
          onChange={(event) => {
            setSpreadsheetId(event.target.value);
            setPreviewRows(null);
          }}
          className={fieldClassName}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sheet-name" className="text-sm font-semibold text-[#1a1a1a]">
          Sheet Name
        </Label>
        <Input
          id="sheet-name"
          value={sheetName}
          onChange={(event) => {
            setSheetName(event.target.value);
            setPreviewRows(null);
          }}
          className={fieldClassName}
        />
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="delete-after-import" className="text-sm font-semibold text-[#1a1a1a]">
          Delete after import
        </Label>
        <input
          id="delete-after-import"
          type="checkbox"
          checked={deleteAfterImport}
          onChange={(event) => setDeleteAfterImport(event.target.checked)}
          className="size-4 rounded border-[#9ca3af]"
        />
      </div>

      {previewRows && (
        <div className="rounded-xl border border-[#e5e7eb] p-4">
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-[#6b7280]">
                  <th className="pb-2 pr-2">Title</th>
                  <th className="pb-2 pr-2">Platform</th>
                  <th className="pb-2">Batch</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, index) => (
                  <tr key={index} className="border-t border-[#f1f5f4]">
                    <td className="py-2 pr-2 font-medium text-[#1a1a1a]">{row.title}</td>
                    <td className="py-2 pr-2 text-[#1a1a1a]">{row.socialPlatform}</td>
                    <td className="py-2 text-[#1a1a1a]">{row.batch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        {previewRows ? (
          <button
            type="button"
            onClick={handleConfirmImport}
            className="flex items-center gap-2 rounded-lg bg-[#f43f5e] px-5 py-2.5 text-sm font-semibold text-white"
          >
            <Upload className="size-4" />
            Confirm import
          </button>
        ) : (
          <button
            type="button"
            disabled={!canFetch || isFetching}
            onClick={handleFetchPreview}
            className={cn(
              "rounded-lg border border-[#2dd4bf] px-5 py-2 text-sm font-semibold text-[#0f766e]",
              (!canFetch || isFetching) && "cursor-not-allowed opacity-40"
            )}
          >
            {isFetching ? "Fetching..." : "Fetch preview"}
          </button>
        )}
      </div>
    </div>
  );
}
