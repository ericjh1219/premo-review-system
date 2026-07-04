"use client";

import { useEffect, useRef } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Post } from "@/lib/mock-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PostsTableProps = {
  posts: Post[];
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
  selectedIds: Set<string>;
  onToggleRow: (id: string) => void;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
};

function YesNoBadge({ value }: { value: boolean }) {
  return (
    <span
      className={
        value
          ? "rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700"
          : "rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-xs font-semibold text-zinc-500"
      }
    >
      {value ? "Yes" : "No"}
    </span>
  );
}

function StatusBadge({ status }: { status: Post["status"] }) {
  return (
    <span
      className={
        status === "active"
          ? "rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700"
          : "rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-xs font-semibold text-zinc-500"
      }
    >
      {status === "active" ? "Active" : "Inactive"}
    </span>
  );
}

export function PostsTable({
  posts,
  onEdit,
  onDelete,
  selectedIds,
  onToggleRow,
  allSelected,
  someSelected,
  onToggleAll,
}: PostsTableProps) {
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [someSelected, allSelected]);

  return (
    <div className="overflow-hidden rounded-t-xl">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-[#eab308]/50 bg-[#e6e2c4] hover:bg-[#e6e2c4]">
            <TableHead className="w-10 border-r border-[#eab308]/30">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                aria-label="Select all posts"
                className="size-4 rounded border-[#9ca3af] accent-blue-600"
              />
            </TableHead>
            <TableHead className="border-r border-[#eab308]/30 font-bold text-[#1a1a1a]">
              ID
            </TableHead>
            <TableHead className="border-r border-[#eab308]/30 font-bold text-[#1a1a1a]">
              Title
            </TableHead>
            <TableHead className="border-r border-[#eab308]/30 font-bold text-[#1a1a1a]">
              Description
            </TableHead>
            <TableHead className="border-r border-[#eab308]/30 font-bold text-[#1a1a1a]">
              Video
            </TableHead>
            <TableHead className="border-r border-[#eab308]/30 font-bold text-[#1a1a1a]">
              Images
            </TableHead>
            <TableHead className="border-r border-[#eab308]/30 font-bold text-[#1a1a1a]">
              Batch
            </TableHead>
            <TableHead className="border-r border-[#eab308]/30 font-bold text-[#1a1a1a]">
              Social Platform
            </TableHead>
            <TableHead className="border-r border-[#eab308]/30 font-bold text-[#1a1a1a]">
              Is used
            </TableHead>
            <TableHead className="border-r border-[#eab308]/30 font-bold text-[#1a1a1a]">
              Status
            </TableHead>
            <TableHead className="font-bold text-[#1a1a1a]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.length === 0 ? (
            <TableRow className="bg-[#fef9c3] hover:bg-[#fef9c3]">
              <TableCell colSpan={11} className="py-8 text-center font-medium text-[#92400e]">
                No data found
              </TableCell>
            </TableRow>
          ) : (
            posts.map((post) => (
              <TableRow key={post.id} className="bg-[#fefce8] hover:bg-[#fef9c3]">
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(post.id)}
                    onChange={() => onToggleRow(post.id)}
                    aria-label={`Select ${post.title}`}
                    className="size-4 rounded border-[#9ca3af] accent-blue-600"
                  />
                </TableCell>
                <TableCell className="font-medium text-[#1a1a1a]">{post.id}</TableCell>
                <TableCell className="text-[#1a1a1a]">{post.title}</TableCell>
                <TableCell className="max-w-xs truncate text-[#57534e]">
                  {post.description}
                </TableCell>
                <TableCell>
                  <YesNoBadge value={post.hasVideo} />
                </TableCell>
                <TableCell className="text-[#1a1a1a]">
                  {post.imageCount > 0 ? post.imageCount : "-"}
                </TableCell>
                <TableCell className="text-[#1a1a1a]">{post.batch}</TableCell>
                <TableCell className="text-[#1a1a1a]">{post.socialPlatform}</TableCell>
                <TableCell>
                  <YesNoBadge value={post.isUsed} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={post.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label={`Edit ${post.title}`}
                      onClick={() => onEdit(post)}
                      className="flex size-7 items-center justify-center rounded-md text-[#57534e] hover:bg-black/5"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${post.title}`}
                      onClick={() => onDelete(post)}
                      className="flex size-7 items-center justify-center rounded-md text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
