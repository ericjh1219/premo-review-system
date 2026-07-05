export type GoogleReviewCategory = {
  id: string;
  businessId: string;
  name: string;
  order: number;
};

async function fetchCategories(businessId: string): Promise<GoogleReviewCategory[]> {
  try {
    const res = await fetch(`/api/review-categories?businessId=${encodeURIComponent(businessId)}`);
    if (!res.ok) return [];
    return (await res.json()) as GoogleReviewCategory[];
  } catch {
    return [];
  }
}

async function writeCategories(businessId: string, categories: GoogleReviewCategory[]): Promise<void> {
  try {
    await fetch(`/api/review-categories?businessId=${encodeURIComponent(businessId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categories),
    });
  } catch {
    // Matches the previous localStorage implementation, which never
    // surfaced a write failure to the caller either.
  }
}

/**
 * Loads a business's Google Review Categories, sorted by display order, from
 * the Review Categories API. Every business starts with no categories —
 * there is no shared demo/seed data. Categories only group Google Review
 * posts; the templates themselves always live in Posts (see
 * lib/post-storage.ts), never here.
 */
export async function listCategories(businessId: string): Promise<GoogleReviewCategory[]> {
  const categories = await fetchCategories(businessId);
  return [...categories].sort((a, b) => a.order - b.order);
}

export async function createCategory(
  businessId: string,
  name: string
): Promise<GoogleReviewCategory> {
  const categories = await listCategories(businessId);
  const nextOrder = categories.reduce((max, category) => Math.max(max, category.order), -1) + 1;

  const category: GoogleReviewCategory = {
    id: `category-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    businessId,
    name,
    order: nextOrder,
  };

  await writeCategories(businessId, [...categories, category]);
  return category;
}

export async function renameCategory(
  businessId: string,
  categoryId: string,
  name: string
): Promise<GoogleReviewCategory | undefined> {
  const categories = await listCategories(businessId);
  let updated: GoogleReviewCategory | undefined;

  const next = categories.map((category) => {
    if (category.id !== categoryId) return category;
    updated = { ...category, name };
    return updated;
  });

  if (updated) await writeCategories(businessId, next);
  return updated;
}

export async function deleteCategory(businessId: string, categoryId: string): Promise<void> {
  const categories = await listCategories(businessId);
  await writeCategories(
    businessId,
    categories.filter((category) => category.id !== categoryId)
  );
}

/**
 * Swaps this category with its immediate neighbor in display order and
 * renumbers everyone's `order` to stay contiguous afterward.
 */
export async function moveCategory(
  businessId: string,
  categoryId: string,
  direction: "up" | "down"
): Promise<GoogleReviewCategory[]> {
  const categories = await listCategories(businessId);
  const index = categories.findIndex((category) => category.id === categoryId);
  const swapWith = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapWith < 0 || swapWith >= categories.length) return categories;

  const reordered = [...categories];
  [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
  const renumbered = reordered.map((category, position) => ({ ...category, order: position }));

  await writeCategories(businessId, renumbered);
  return renumbered;
}
