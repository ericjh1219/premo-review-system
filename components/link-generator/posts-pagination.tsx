"use client";

type PostsPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function PostsPagination({ page, totalPages, onPageChange }: PostsPaginationProps) {
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="flex items-center justify-end gap-3 py-4 text-sm text-[#1a1a1a]">
      <button
        type="button"
        disabled={!canGoPrevious}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg border border-[#d1d5db] bg-white/70 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      <span className="flex items-center gap-2">
        Page
        <input
          type="text"
          readOnly
          value={totalPages === 0 ? 0 : page}
          className="h-8 w-12 rounded-md border border-[#d1d5db] bg-white/70 text-center"
        />
        of {totalPages}
      </span>

      <button
        type="button"
        disabled={!canGoNext}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border border-[#d1d5db] bg-white/70 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
