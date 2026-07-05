"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getEffectiveSubscriptionStatus,
  listBusinesses,
  updateBusinessSubscription,
  type Business,
  type SubscriptionStatus,
} from "@/lib/business";
import {
  getSubscriptionPlan,
  SUBSCRIPTION_PLAN_LIST,
  type SubscriptionPlanId,
} from "@/lib/subscription-plans";

const STATUSES: SubscriptionStatus[] = ["active", "trial", "expired", "suspended"];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function toDateInputValue(value: string) {
  return value.slice(0, 10);
}

type FormState = {
  plan: SubscriptionPlanId;
  startDate: string;
  expiryDate: string;
  status: SubscriptionStatus;
  monthlyAiCredits: number;
  branchLimit: number;
  luckyDrawEnabled: boolean;
  autoRenew: boolean;
};

export default function SubscriptionsPage() {
  const searchParams = useSearchParams();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    listBusinesses().then((loaded) => {
      setBusinesses(loaded);

      const deepLinkId = searchParams.get("business");
      if (deepLinkId) {
        const business = loaded.find((existing) => existing.id === deepLinkId);
        if (business) openEditForm(business);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredBusinesses = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return businesses;

    return businesses.filter((business) =>
      [business.name, business.id].join(" ").toLowerCase().includes(query)
    );
  }, [businesses, search]);

  function openEditForm(business: Business) {
    setEditingBusiness(business);
    setForm({
      plan: business.subscription.plan,
      startDate: toDateInputValue(business.subscription.startDate),
      expiryDate: toDateInputValue(business.subscription.expiryDate),
      status: business.subscription.status,
      monthlyAiCredits: business.subscription.monthlyAiCredits,
      branchLimit: business.subscription.branchLimit,
      luckyDrawEnabled: business.subscription.luckyDrawEnabled,
      autoRenew: business.subscription.autoRenew,
    });
    setFormError(null);
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setEditingBusiness(null);
      setForm(null);
      setFormError(null);
    }
  }

  function handlePlanChange(plan: SubscriptionPlanId | null) {
    if (!plan) return;
    const defaults = getSubscriptionPlan(plan);
    setForm((prev) =>
      prev
        ? {
            ...prev,
            plan,
            monthlyAiCredits: defaults.monthlyAiCredits,
            branchLimit: defaults.branchLimit,
            luckyDrawEnabled: defaults.luckyDrawEnabled,
          }
        : prev
    );
  }

  async function handleSave() {
    if (!editingBusiness || !form) return;

    if (!form.startDate || !form.expiryDate) {
      setFormError("Start date and expiry date are required.");
      return;
    }
    if (new Date(form.expiryDate).getTime() < new Date(form.startDate).getTime()) {
      setFormError("Expiry date must be on or after the start date.");
      return;
    }
    if (form.monthlyAiCredits < 0 || form.branchLimit < 1) {
      setFormError("Monthly AI Credits must be 0 or more, and Branch Limit must be at least 1.");
      return;
    }

    const updated = await updateBusinessSubscription(editingBusiness.id, {
      plan: form.plan,
      startDate: new Date(form.startDate).toISOString(),
      expiryDate: new Date(form.expiryDate).toISOString(),
      status: form.status,
      monthlyAiCredits: form.monthlyAiCredits,
      branchLimit: form.branchLimit,
      luckyDrawEnabled: form.luckyDrawEnabled,
      autoRenew: form.autoRenew,
    });

    if (updated) {
      setBusinesses((current) =>
        current.map((business) => (business.id === updated.id ? updated : business))
      );
    }
    setEditingBusiness(null);
    setForm(null);
  }

  return (
    <>
      <PageHeader
        title="Subscriptions"
        description="Manage platform plans and feature access for every business"
      />

      <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search businesses..."
                className="pl-9"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {filteredBusinesses.length} of {businesses.length} businesses
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Business Name</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>AI Credits</TableHead>
                  <TableHead>Branches</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBusinesses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      No businesses match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBusinesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell className="font-medium">{business.name}</TableCell>
                      <TableCell className="capitalize">
                        {getSubscriptionPlan(business.subscription.plan).name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {business.subscription.remainingAiCredits} /{" "}
                        {business.subscription.monthlyAiCredits}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {business.subscription.branchLimit}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(business.subscription.expiryDate)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={getEffectiveSubscriptionStatus(business)} />
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => openEditForm(business)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(editingBusiness)} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CreditCard className="size-5" />
            </div>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Update the plan and feature access for{" "}
              <span className="font-medium text-foreground">{editingBusiness?.name}</span>.
            </DialogDescription>
          </DialogHeader>

          {form && (
            <div className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label htmlFor="subscription-plan">Plan</Label>
                <Select value={form.plan} onValueChange={handlePlanChange}>
                  <SelectTrigger id="subscription-plan" className="w-full">
                    <SelectValue>
                      {(value: SubscriptionPlanId) => getSubscriptionPlan(value).name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {SUBSCRIPTION_PLAN_LIST.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} — {plan.priceLabel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="subscription-start">Start Date</Label>
                  <Input
                    id="subscription-start"
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      setForm((prev) => (prev ? { ...prev, startDate: event.target.value } : prev))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subscription-expiry">Expiry Date</Label>
                  <Input
                    id="subscription-expiry"
                    type="date"
                    value={form.expiryDate}
                    onChange={(event) =>
                      setForm((prev) => (prev ? { ...prev, expiryDate: event.target.value } : prev))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscription-status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((prev) =>
                      prev ? { ...prev, status: value as SubscriptionStatus } : prev
                    )
                  }
                >
                  <SelectTrigger id="subscription-status" className="w-full">
                    <SelectValue className="capitalize" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status} className="capitalize">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  A business is automatically treated as expired once the expiry date passes,
                  even if this is still set to active.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="subscription-ai-credits">Monthly AI Credits</Label>
                  <Input
                    id="subscription-ai-credits"
                    type="number"
                    min={0}
                    value={form.monthlyAiCredits}
                    onChange={(event) =>
                      setForm((prev) =>
                        prev ? { ...prev, monthlyAiCredits: Number(event.target.value) } : prev
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subscription-branch-limit">Branch Limit</Label>
                  <Input
                    id="subscription-branch-limit"
                    type="number"
                    min={1}
                    value={form.branchLimit}
                    onChange={(event) =>
                      setForm((prev) =>
                        prev ? { ...prev, branchLimit: Number(event.target.value) } : prev
                      )
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 px-3.5 py-3">
                <div>
                  <Label className="text-sm font-semibold">Lucky Draw</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow this business to run Lucky Draw promotions.
                  </p>
                </div>
                <Switch
                  checked={form.luckyDrawEnabled}
                  onCheckedChange={(checked) =>
                    setForm((prev) => (prev ? { ...prev, luckyDrawEnabled: checked } : prev))
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 px-3.5 py-3">
                <div>
                  <Label className="text-sm font-semibold">Auto Renew</Label>
                  <p className="text-xs text-muted-foreground">
                    Flag only — no billing is processed in this version.
                  </p>
                </div>
                <Switch
                  checked={form.autoRenew}
                  onCheckedChange={(checked) =>
                    setForm((prev) => (prev ? { ...prev, autoRenew: checked } : prev))
                  }
                />
              </div>

              {formError && <p className="text-sm text-destructive">{formError}</p>}
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
