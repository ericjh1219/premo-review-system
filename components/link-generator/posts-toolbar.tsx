"use client";

import { Pencil, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PostsToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  batch: string;
  onBatchChange: (value: string) => void;
  batchOptions: string[];
  socialPlatform: string;
  onSocialPlatformChange: (value: string) => void;
  socialPlatformOptions: string[];
  usedFilter: string;
  onUsedFilterChange: (value: string) => void;
  onCreatePost: () => void;
};

export function PostsToolbar({
  search,
  onSearchChange,
  batch,
  onBatchChange,
  batchOptions,
  socialPlatform,
  onSocialPlatformChange,
  socialPlatformOptions,
  usedFilter,
  onUsedFilterChange,
  onCreatePost,
}: PostsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <h1 className="mr-auto text-3xl font-extrabold tracking-tight text-[#1a1a1a]">Posts</h1>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#9ca3af]" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search posts..."
          className="h-10 w-56 rounded-lg border border-[#d1d5db] bg-white/70 pl-9 pr-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#9ca3af] sm:w-64"
        />
      </div>

      <Select value={batch} onValueChange={(value) => onBatchChange(value ?? "all")}>
        <SelectTrigger className="h-10 min-w-[130px] bg-white/70">
          <SelectValue>{(value: string) => (value === "all" ? "All Batch" : value)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Batch</SelectItem>
          {batchOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={socialPlatform}
        onValueChange={(value) => onSocialPlatformChange(value ?? "all")}
      >
        <SelectTrigger className="h-10 min-w-[170px] bg-white/70">
          <SelectValue>
            {(value: string) => (value === "all" ? "All Social Platform" : value)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Social Platform</SelectItem>
          {socialPlatformOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={usedFilter} onValueChange={(value) => onUsedFilterChange(value ?? "all")}>
        <SelectTrigger className="h-10 min-w-[90px] bg-white/70">
          <SelectValue>
            {(value: string) => {
              if (value === "used") return "Used";
              if (value === "unused") return "Unused";
              return "All";
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="used">Used</SelectItem>
          <SelectItem value="unused">Unused</SelectItem>
        </SelectContent>
      </Select>

      <button
        type="button"
        onClick={onCreatePost}
        className="flex h-10 items-center gap-1.5 rounded-full bg-[#facc15] px-5 text-sm font-bold text-[#1a1a1a] shadow-sm"
      >
        Create Post
        <Pencil className="size-3.5" />
      </button>
    </div>
  );
}
