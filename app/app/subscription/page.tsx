"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Clock, Plus } from "lucide-react";
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
import { getBusinessById, getEffectiveSubscriptionStatus, type Business } from "@/lib/business";
import { getSubscriptionPlan } from "@/lib/subscription-plans";
import { createBranch, listBranches, type Branch } from "@/lib/branches";
import { SUBSCRIPTION_EXPIRED_MESSAGE } from "@/lib/subscription";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  trial: "bg-blue-100 text-blue-700",
  expired: "bg-red-100 text-red-700",
  suspended: "bg-amber-100 text-amber-700",
};

export default function SubscriptionPage() {
  const [businessId] = useState(resolveBusinessId);
  const [business, setBusiness] = useState<Business | undefined>(undefined);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [addBranchOpen, setAddBranchOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [branchError, setBranchError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    getBusinessById(businessId).then(setBusiness);
    setBranches(listBranches(businessId));
  }, [businessId]);

  if (!business) {
    return (
      <div className="theme-force-light min-h-screen bg-[#fff7ed] pb-28">
        <div className="mx-auto w-full max-w-2xl px-5 pt-6 sm:px-6 sm:pt-8">
          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#57534e]"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const plan = getSubscriptionPlan(business.subscription.plan);
  const status = getEffectiveSubscriptionStatus(business);

  function openAddBranch() {
    setNewBranchName("");
    setBranchError(null);
    setAddBranchOpen(true);
  }

  function handleAddBranch() {
    if (!business) return;
    const name = newBranchName.trim();
    if (!name) {
      setBranchError("Branch name is required.");
      return;
    }

    const result = createBranch(business, name);
    if (!result.success) {
      setBranchError(result.message);
      return;
    }

    setBranches(listBranches(business.id));
    setAddBranchOpen(false);
    setToastMessage("Branch added.");
  }

  return (
    <div className="theme-force-light min-h-screen bg-[#fff7ed] pb-28">
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
            My Subscription
          </h1>
          <p className="mt-1 text-sm text-[#57534e]">
            View your current plan and usage. Contact PREMO to change your plan.
          </p>
        </div>

        {status === "expired" && (
          <div className="flex items-start gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            <Clock className="mt-0.5 size-4 shrink-0" />
            <p>{SUBSCRIPTION_EXPIRED_MESSAGE}</p>
          </div>
        )}

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1a1a1a]">{plan.name}</h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[status] ?? "bg-zinc-100 text-zinc-600"}`}
            >
              {status}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-[#78716c]">{plan.priceLabel}</p>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-[#a8a29e]">Start Date</p>
              <p className="font-semibold text-[#1a1a1a]">
                {formatDate(business.subscription.startDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#a8a29e]">Expiry Date</p>
              <p className="font-semibold text-[#1a1a1a]">
                {formatDate(business.subscription.expiryDate)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs text-[#a8a29e]">AI Credits</p>
            <p className="mt-1 text-lg font-bold text-[#1a1a1a]">
              {business.subscription.remainingAiCredits} / {business.subscription.monthlyAiCredits}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs text-[#a8a29e]">Branch</p>
            <p className="mt-1 text-lg font-bold text-[#1a1a1a]">
              {branches.length} / {business.subscription.branchLimit}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1a1a1a]">Branches</h3>
            <Button size="sm" variant="outline" onClick={openAddBranch} className="gap-1.5">
              <Plus className="size-3.5" />
              Add Branch
            </Button>
          </div>
          <div className="mt-3 space-y-2">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="rounded-xl border border-[#e7e5e4] px-3 py-2 text-sm text-[#1a1a1a]"
              >
                {branch.name}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#1a1a1a]">Lucky Draw</h3>
          <p className="mt-1 text-lg font-bold text-[#1a1a1a]">
            {business.subscription.luckyDrawEnabled ? "Enabled" : "Disabled"}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-[#1a1a1a]">Plan Features</h3>
          <div className="space-y-2.5">
            {plan.features.map((feature) => (
              <div key={feature.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[#1a1a1a]">
                  {feature.availability === "coming-soon" ? (
                    <Clock className="size-3.5 text-[#a8a29e]" />
                  ) : (
                    <Check className="size-3.5 text-[#22c55e]" />
                  )}
                  {feature.label}
                </span>
                {feature.availability === "coming-soon" && (
                  <span className="rounded-full bg-[#f1f5f4] px-2 py-0.5 text-xs font-semibold text-[#78716c]">
                    Coming Soon
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={addBranchOpen} onOpenChange={setAddBranchOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Add Branch</DialogTitle>
            <DialogDescription>
              Your {plan.name} plan allows up to {business.subscription.branchLimit} branch
              {business.subscription.branchLimit === 1 ? "" : "es"}.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-2">
            <Label htmlFor="branch-name">Branch Name</Label>
            <Input
              id="branch-name"
              value={newBranchName}
              onChange={(event) => setNewBranchName(event.target.value)}
              placeholder="e.g. Downtown Outlet"
            />
            {branchError && <p className="text-sm text-destructive">{branchError}</p>}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setAddBranchOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBranch}>Add Branch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />

      <BottomNav />
    </div>
  );
}
