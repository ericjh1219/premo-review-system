import { getBusinessById, type Business } from "@/lib/business";
import { canCreateBranch, type GateBlockReason } from "@/lib/subscription";

export type Branch = {
  id: string;
  businessId: string;
  name: string;
  createdAt: string;
};

function storageKey(businessId: string) {
  return `premo-branches:${businessId}`;
}

/**
 * Every business starts with one implicit "Main Branch" so branch usage
 * (e.g. "1 / 1") reads correctly from day one without requiring setup.
 */
function seedFor(businessId: string): Branch[] {
  return [
    {
      id: `branch-${businessId}-main`,
      businessId,
      name: "Main Branch",
      createdAt: new Date().toISOString(),
    },
  ];
}

export function listBranches(businessId: string): Branch[] {
  if (typeof window === "undefined") return seedFor(businessId);

  try {
    const raw = window.localStorage.getItem(storageKey(businessId));
    if (raw) return JSON.parse(raw) as Branch[];

    const seed = seedFor(businessId);
    writeBranches(businessId, seed);
    return seed;
  } catch {
    return seedFor(businessId);
  }
}

function writeBranches(businessId: string, branches: Branch[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(businessId), JSON.stringify(branches));
}

export type CreateBranchResult =
  | { success: true; branch: Branch }
  | { success: false; reason: GateBlockReason; message: string };

/** Creates a branch for this business, enforcing the plan's branch limit and subscription status first. */
export function createBranch(business: Business, name: string): CreateBranchResult {
  const branches = listBranches(business.id);
  const gate = canCreateBranch(business, branches.length);

  if (!gate.allowed) {
    return { success: false, reason: gate.reason, message: gate.message };
  }

  const branch: Branch = {
    id: `branch-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    businessId: business.id,
    name,
    createdAt: new Date().toISOString(),
  };

  writeBranches(business.id, [...branches, branch]);
  return { success: true, branch };
}

export function deleteBranch(businessId: string, branchId: string) {
  writeBranches(
    businessId,
    listBranches(businessId).filter((branch) => branch.id !== branchId)
  );
}

/** Convenience helper for read-only usage displays (e.g. "1 / 1" on the Subscription page). */
export async function getBranchUsage(businessId: string): Promise<{ used: number; limit: number }> {
  const business = await getBusinessById(businessId);
  return {
    used: listBranches(businessId).length,
    limit: business?.subscription.branchLimit ?? 1,
  };
}
