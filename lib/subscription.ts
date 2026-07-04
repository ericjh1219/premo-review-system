import { getEffectiveSubscriptionStatus, type Business } from "@/lib/business";

export const SUBSCRIPTION_EXPIRED_MESSAGE =
  "Your subscription has expired. Please renew your subscription to continue using PREMO.";
export const UPGRADE_REQUIRED_MESSAGE = "Upgrade Required";

export type GateBlockReason = "suspended" | "expired" | "upgrade-required";

export type GateResult =
  | { allowed: true }
  | { allowed: false; reason: GateBlockReason; message: string };

/**
 * The baseline check every create/mutate action across the app should run
 * before proceeding — expired businesses keep read-only access (viewing the
 * Dashboard, Profile, existing QR Codes, Statistics), while suspended
 * businesses are blocked outright by SubscriptionGuard before they ever
 * reach a page that would call this. Future features (AI generation, Lucky
 * Draw management, Branches, etc.) should call this first.
 */
export function canPerformCreateAction(business: Business): GateResult {
  const status = getEffectiveSubscriptionStatus(business);

  if (status === "suspended") {
    return { allowed: false, reason: "suspended", message: SUBSCRIPTION_EXPIRED_MESSAGE };
  }
  if (status === "expired") {
    return { allowed: false, reason: "expired", message: SUBSCRIPTION_EXPIRED_MESSAGE };
  }
  return { allowed: true };
}

/** Whether this business can create one more branch, given its plan's branchLimit. */
export function canCreateBranch(business: Business, currentBranchCount: number): GateResult {
  const baseGate = canPerformCreateAction(business);
  if (!baseGate.allowed) return baseGate;

  if (currentBranchCount >= business.subscription.branchLimit) {
    return { allowed: false, reason: "upgrade-required", message: UPGRADE_REQUIRED_MESSAGE };
  }
  return { allowed: true };
}

/** Whether Lucky Draw can be shown/used for this business right now (plan allows it, and the subscription isn't expired/suspended). */
export function canUseLuckyDraw(business: Business): GateResult {
  const baseGate = canPerformCreateAction(business);
  if (!baseGate.allowed) return baseGate;

  if (!business.subscription.luckyDrawEnabled) {
    return { allowed: false, reason: "upgrade-required", message: UPGRADE_REQUIRED_MESSAGE };
  }
  return { allowed: true };
}

/** Whether this business currently has any AI credits left to spend. No deduction logic yet — every future AI feature will call this before consuming from the same pool. */
export function hasAiCreditsAvailable(business: Business): boolean {
  return business.subscription.remainingAiCredits > 0;
}
