type BatchActionPanelProps = {
  selectedCount: number;
  onUnselect: () => void;
  onDelete: () => void;
  onEditBatch: () => void;
  onRestoreUsedState: () => void;
};

export function BatchActionPanel({
  selectedCount,
  onUnselect,
  onDelete,
  onEditBatch,
  onRestoreUsedState,
}: BatchActionPanelProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="absolute top-2 left-1/2 z-40 w-[380px] -translate-x-1/2 rounded-2xl bg-white p-6 shadow-xl">
      <p className="text-center text-base font-semibold text-[#1a1a1a]">
        You had selected <span className="font-bold text-teal-600">{selectedCount}</span> share
        info(s)
      </p>

      <div className="mt-4 space-y-3">
        <button
          type="button"
          onClick={onUnselect}
          className="w-full rounded-lg border-2 border-[#2dd4bf] py-3 text-sm font-bold text-teal-600"
        >
          Unselect
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="w-full rounded-lg bg-[#ec4899] py-3 text-sm font-bold text-white"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={onEditBatch}
          className="w-full rounded-lg bg-[#1a1a1a] py-3 text-sm font-bold text-white"
        >
          Edit Batch
        </button>
        <button
          type="button"
          onClick={onRestoreUsedState}
          className="w-full rounded-lg bg-[#84cc16] py-3 text-sm font-bold text-white"
        >
          Restore used state
        </button>
      </div>
    </div>
  );
}
