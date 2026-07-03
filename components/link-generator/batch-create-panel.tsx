"use client";

import { useRef, useState } from "react";
import { Download, Eye, Upload } from "lucide-react";
import { buildCsv, parseCsv } from "@/lib/csv";
import type { NewPostInput } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type ParsedPostRow = NewPostInput & {
  isValid: boolean;
  error: string | null;
};

type BatchCreatePanelProps = {
  socialPlatformOptions: string[];
  onImport: (posts: NewPostInput[]) => void;
};

const SAMPLE_ROWS = [
  ["Title", "Description", "Social Platform", "Batch", "Video", "Images"],
  [
    "Sample post 1",
    "Example description for the first sample post.",
    "Facebook",
    "Batch #1",
    "no",
    "https://example.com/img1.jpg|https://example.com/img2.jpg",
  ],
  [
    "Sample post 2",
    "Example description for the second sample post.",
    "Rednote",
    "Batch #2",
    "yes",
    "",
  ],
];

function parsePostsCsv(text: string, platformOptions: string[]): ParsedPostRow[] {
  const rows = parseCsv(text);
  if (rows.length <= 1) return [];
  const dataRows = rows.slice(1);

  return dataRows.map((cells) => {
    const [titleRaw, descriptionRaw, platformRaw, batchRaw, videoRaw, imagesRaw] = cells;
    const title = (titleRaw ?? "").trim();
    const description = (descriptionRaw ?? "").trim();
    const platformInput = (platformRaw ?? "").trim();
    const batch = (batchRaw ?? "").trim();
    const videoInput = (videoRaw ?? "").trim();
    const imagesInput = (imagesRaw ?? "").trim();

    const matchedPlatform = platformOptions.find(
      (option) => option.toLowerCase() === platformInput.toLowerCase()
    );

    const errors: string[] = [];
    if (!title) errors.push("Title is required");
    if (!matchedPlatform) errors.push(`Unknown platform "${platformInput || "empty"}"`);

    const imageCount = imagesInput
      ? imagesInput
          .split("|")
          .map((link) => link.trim())
          .filter(Boolean).length
      : 0;
    const hasVideo = videoInput.length > 0 && !/^(no|false|0)$/i.test(videoInput);

    return {
      title,
      description,
      batch: batch || "Unassigned",
      socialPlatform: matchedPlatform ?? platformInput,
      hasVideo,
      imageCount,
      isValid: errors.length === 0,
      error: errors.length > 0 ? errors.join("; ") : null,
    };
  });
}

export function BatchCreatePanel({ socialPlatformOptions, onImport }: BatchCreatePanelProps) {
  const [rows, setRows] = useState<ParsedPostRow[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasRows = rows !== null && rows.length > 0;
  const allValid = hasRows && rows.every((row) => row.isValid);

  function handleGetSample() {
    const csv = buildCsv(SAMPLE_ROWS);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "posts-sample.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setRows(parsePostsCsv(text, socialPlatformOptions));
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function handleConfirm() {
    if (!rows || !allValid) return;

    onImport(
      rows.map((row) => ({
        title: row.title,
        description: row.description,
        batch: row.batch,
        socialPlatform: row.socialPlatform,
        hasVideo: row.hasVideo,
        imageCount: row.imageCount,
      }))
    );
    setRows(null);
  }

  return (
    <div className="mt-5 space-y-4">
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={handleGetSample}
          className="flex items-center gap-2 rounded-lg bg-[#5eead4] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Download className="size-4" />
          Get Sample
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Upload className="size-4" />
          Upload CSV
        </button>
      </div>

      <div className="min-h-[160px] rounded-xl border border-[#e5e7eb] p-4">
        {rows === null ? (
          <div className="flex h-32 items-center justify-center gap-2 text-sm text-[#6b7280]">
            Preview unavailable yet.
            <Eye className="size-4" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#6b7280]">No rows found in this file.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-[#6b7280]">
                  <th className="pb-2 pr-2">Title</th>
                  <th className="pb-2 pr-2">Platform</th>
                  <th className="pb-2 pr-2">Batch</th>
                  <th className="pb-2">Issue</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={index}
                    className={cn("border-t border-[#f1f5f4]", !row.isValid && "bg-red-50")}
                  >
                    <td className="py-2 pr-2 font-medium text-[#1a1a1a]">{row.title || "—"}</td>
                    <td className="py-2 pr-2 text-[#1a1a1a]">{row.socialPlatform || "—"}</td>
                    <td className="py-2 pr-2 text-[#1a1a1a]">{row.batch}</td>
                    <td className="py-2 text-red-600">{row.error ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!allValid}
          onClick={handleConfirm}
          className="flex items-center gap-2 rounded-lg bg-[#f43f5e] px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Upload className="size-4" />
          Confirm upload
        </button>
      </div>
    </div>
  );
}
