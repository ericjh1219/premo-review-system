export type GoogleReviewCategory = {
  id: string;
  businessId: string;
  name: string;
  order: number;
};

function storageKey(businessId: string) {
  return `premo-google-review-categories:${businessId}`;
}

/**
 * Loads a business's Google Review Categories, sorted by display order.
 * Every business starts with no categories — there is no shared demo/seed
 * data. Categories only group Google Review posts; the templates themselves
 * always live in Posts (see lib/post-storage.ts), never here.
 */
export function listCategories(businessId: string): GoogleReviewCategory[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(storageKey(businessId));
    const categories = raw ? (JSON.parse(raw) as GoogleReviewCategory[]) : [];
    return [...categories].sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

function writeCategories(businessId: string, categories: GoogleReviewCategory[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(businessId), JSON.stringify(categories));
}

export function createCategory(businessId: string, name: string): GoogleReviewCategory {
  const categories = listCategories(businessId);
  const nextOrder = categories.reduce((max, category) => Math.max(max, category.order), -1) + 1;

  const category: GoogleReviewCategory = {
    id: `category-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    businessId,
    name,
    order: nextOrder,
  };

  writeCategories(businessId, [...categories, category]);
  return category;
}

export function renameCategory(
  businessId: string,
  categoryId: string,
  name: string
): GoogleReviewCategory | undefined {
  const categories = listCategories(businessId);
  let updated: GoogleReviewCategory | undefined;

  const next = categories.map((category) => {
    if (category.id !== categoryId) return category;
    updated = { ...category, name };
    return updated;
  });

  if (updated) writeCategories(businessId, next);
  return updated;
}

export function deleteCategory(businessId: string, categoryId: string) {
  writeCategories(
    businessId,
    listCategories(businessId).filter((category) => category.id !== categoryId)
  );
}

/**
 * Swaps this category with its immediate neighbor in display order and
 * renumbers everyone's `order` to stay contiguous afterward.
 */
export function moveCategory(
  businessId: string,
  categoryId: string,
  direction: "up" | "down"
): GoogleReviewCategory[] {
  const categories = listCategories(businessId);
  const index = categories.findIndex((category) => category.id === categoryId);
  const swapWith = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapWith < 0 || swapWith >= categories.length) return categories;

  const reordered = [...categories];
  [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
  const renumbered = reordered.map((category, position) => ({ ...category, order: position }));

  writeCategories(businessId, renumbered);
  return renumbered;
}
