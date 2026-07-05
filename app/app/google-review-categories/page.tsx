"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import { BottomNav } from "@/components/link-generator/bottom-nav";
import { Toast } from "@/components/link-generator/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resolveBusinessId } from "@/lib/auth";
import { getBusinessById } from "@/lib/business";
import {
  createCategory,
  deleteCategory,
  listCategories,
  moveCategory,
  renameCategory,
  type GoogleReviewCategory,
} from "@/lib/review-categories";
import { canPerformCreateAction } from "@/lib/subscription";

export default function GoogleReviewCategoriesPage() {
  const [businessId] = useState(resolveBusinessId);
  const [categories, setCategories] = useState<GoogleReviewCategory[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const [renameTarget, setRenameTarget] = useState<GoogleReviewCategory | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<GoogleReviewCategory | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listCategories(businessId).then((loaded) => {
      if (!cancelled) setCategories(loaded);
    });

    return () => {
      cancelled = true;
    };
  }, [businessId]);

  async function openCreate() {
    const business = await getBusinessById(businessId);
    const gate = business ? canPerformCreateAction(business) : { allowed: true as const };
    if (!gate.allowed) {
      setToastMessage(gate.message);
      return;
    }
    setNewCategoryName("");
    setCreateError(null);
    setCreateOpen(true);
  }

  async function handleCreate() {
    const name = newCategoryName.trim();
    if (!name) {
      setCreateError("Category name is required.");
      return;
    }
    await createCategory(businessId, name);
    setCategories(await listCategories(businessId));
    setCreateOpen(false);
  }

  function openRename(category: GoogleReviewCategory) {
    setRenameTarget(category);
    setRenameValue(category.name);
    setRenameError(null);
  }

  function handleRenameOpenChange(open: boolean) {
    if (!open) {
      setRenameTarget(null);
      setRenameValue("");
      setRenameError(null);
    }
  }

  async function handleConfirmRename() {
    if (!renameTarget) return;
    const name = renameValue.trim();
    if (!name) {
      setRenameError("Category name is required.");
      return;
    }
    await renameCategory(businessId, renameTarget.id, name);
    setCategories(await listCategories(businessId));
    setRenameTarget(null);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    await deleteCategory(businessId, deleteTarget.id);
    setCategories(await listCategories(businessId));
    setDeleteTarget(null);
  }

  async function handleMove(categoryId: string, direction: "up" | "down") {
    setCategories(await moveCategory(businessId, categoryId, direction));
  }

  return (
    <div className="min-h-screen bg-[#fdf4ff] pb-28">
      <div className="mx-auto w-full max-w-2xl space-y-4 px-5 pt-6 sm:px-6 sm:pt-8">
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#57534e]"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>

        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-[#1a1a1a] sm:text-[24px]">
            Google Review Categories
          </h1>
          <p className="mt-1 text-sm text-[#57534e]">
            Organize your Google Review posts into categories. Assign a category to a post from
            the Posts page.
          </p>
        </div>

        <Button size="sm" onClick={openCreate} className="gap-1.5">
          <Plus className="size-4" />
          Add Category
        </Button>

        <div className="space-y-3">
          {categories.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-center text-sm text-[#78716c] shadow-sm">
              No categories yet. Create one to start organizing your Google Review posts.
            </div>
          ) : (
            categories.map((category, index) => (
              <div key={category.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="truncate text-sm font-bold text-[#1a1a1a]">{category.name}</p>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleMove(category.id, "up")}
                    disabled={index === 0}
                    aria-label={`Move ${category.name} up`}
                    className="flex items-center justify-center rounded-lg bg-[#f1f5f4] px-3 py-2 text-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(category.id, "down")}
                    disabled={index === categories.length - 1}
                    aria-label={`Move ${category.name} down`}
                    className="flex items-center justify-center rounded-lg bg-[#f1f5f4] px-3 py-2 text-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openRename(category)}
                    aria-label={`Rename ${category.name}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#f1f5f4] px-3 py-2 text-xs font-semibold text-[#1a1a1a]"
                  >
                    <Pencil className="size-3.5" />
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(category)}
                    aria-label={`Delete ${category.name}`}
                    className="flex items-center justify-center rounded-lg bg-[#fee2e2] px-3 py-2 text-[#b91c1c]"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>
              Create a new Google Review Category for this business.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder="e.g. Graduation"
            />
            {createError && <p className="text-sm text-destructive">{createError}</p>}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(renameTarget)} onOpenChange={handleRenameOpenChange}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Rename Category</DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-2">
            <Label htmlFor="rename-category-name">Category Name</Label>
            <Input
              id="rename-category-name"
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
            />
            {renameError && <p className="text-sm text-destructive">{renameError}</p>}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => handleRenameOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRename}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Delete category?</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">{deleteTarget?.name}</span>. Posts
              assigned to this category will remain but become uncategorized. This can't be
              undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />

      <BottomNav />
    </div>
  );
}
