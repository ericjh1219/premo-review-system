"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createBusiness,
  DEFAULT_BUSINESS_PASSWORD,
  DEMO_BUSINESS,
  deleteBusiness,
  getEffectiveSubscriptionStatus,
  listBusinesses,
  suggestLoginId,
  updateBusiness,
  updateBusinessSubscription,
  type Business,
  type BusinessStatus,
} from "@/lib/business";
import { getSubscriptionPlan, SUBSCRIPTION_PLAN_LIST, type SubscriptionPlanId } from "@/lib/subscription-plans";
import { startImpersonation } from "@/lib/auth";

const STATUSES: BusinessStatus[] = ["active", "inactive"];

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

function defaultExpiryDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return toDateInputValue(date.toISOString());
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The Active/Inactive/Expired label shown in the table — combines the business's own status with its subscription's expiry. */
function displayStatus(business: Business): "active" | "inactive" | "expired" {
  if (business.status === "inactive") return "inactive";
  if (getEffectiveSubscriptionStatus(business) === "expired") return "expired";
  return "active";
}

type FormState = {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phoneNumber: string;
  loginId: string;
  password: string;
  confirmPassword: string;
  plan: SubscriptionPlanId;
  expiryDate: string;
  status: BusinessStatus;
};

function emptyForm(): FormState {
  return {
    id: "",
    name: "",
    contactName: "",
    email: "",
    phoneNumber: "",
    loginId: "",
    password: "",
    confirmPassword: "",
    plan: "basic",
    expiryDate: defaultExpiryDate(),
    status: "active",
  };
}

export default function BusinessesPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Business | null>(null);

  useEffect(() => {
    listBusinesses().then(setBusinesses);
  }, []);

  const filteredBusinesses = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return businesses;

    return businesses.filter((business) =>
      [business.name, business.loginId, business.email].join(" ").toLowerCase().includes(query)
    );
  }, [businesses, search]);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm());
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(business: Business) {
    setEditingId(business.id);
    setForm({
      id: business.id,
      name: business.name,
      contactName: business.contactName,
      email: business.email,
      phoneNumber: business.phoneNumber,
      loginId: business.loginId,
      password: business.password,
      confirmPassword: business.password,
      plan: business.subscription.plan,
      expiryDate: toDateInputValue(business.subscription.expiryDate),
      status: business.status,
    });
    setFormError(null);
    setFormOpen(true);
  }

  function handleFormOpenChange(open: boolean) {
    setFormOpen(open);
    if (!open) {
      setEditingId(null);
      setForm(emptyForm());
      setFormError(null);
    }
  }

  async function handleSave() {
    const name = form.name.trim();
    const contactName = form.contactName.trim();
    const email = form.email.trim();
    const phoneNumber = form.phoneNumber.trim();
    const password = form.password.trim();
    const confirmPassword = form.confirmPassword.trim();

    if (!name) {
      setFormError("Business name is required.");
      return;
    }
    if (!password || password !== confirmPassword) {
      setFormError("Password and confirmation must match.");
      return;
    }
    if (!form.expiryDate) {
      setFormError("Expiry date is required.");
      return;
    }

    const expiryDate = new Date(form.expiryDate).toISOString();

    if (editingId) {
      const loginId = form.loginId.trim();
      if (!loginId) {
        setFormError("Login ID is required.");
        return;
      }

      const { business: updated, error } = await updateBusiness(editingId, {
        name,
        contactName,
        email,
        phoneNumber,
        loginId,
        password,
        status: form.status,
      });
      if (error) {
        setFormError(error);
        return;
      }
      if (updated) {
        const withSubscription = await updateBusinessSubscription(editingId, {
          plan: form.plan,
          expiryDate,
        });
        setBusinesses((current) =>
          current.map((business) =>
            business.id === editingId ? withSubscription ?? updated : business
          )
        );
      }
      setFormOpen(false);
      return;
    }

    const id = form.id.trim() ? slugify(form.id) : slugify(name);
    if (!id) {
      setFormError("Business ID is required.");
      return;
    }
    if (businesses.some((business) => business.id === id)) {
      setFormError(`Business ID "${id}" is already in use.`);
      return;
    }

    const loginId = form.loginId.trim() || suggestLoginId(id, businesses);

    const { business: created, error } = await createBusiness({
      id,
      name,
      contactName,
      email,
      phoneNumber,
      loginId,
      password,
      plan: form.plan,
      expiryDate,
      status: form.status,
    });
    if (error) {
      setFormError(error);
      return;
    }
    if (created) {
      setBusinesses((current) => [...current, created]);
    }
    setFormOpen(false);
  }

  async function handleToggleStatus(business: Business) {
    const nextStatus = business.status === "active" ? "inactive" : "active";
    const { business: updated } = await updateBusiness(business.id, { status: nextStatus });
    if (updated) {
      setBusinesses((current) =>
        current.map((existing) => (existing.id === business.id ? updated : existing))
      );
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    await deleteBusiness(deleteTarget.id);
    setBusinesses((current) => current.filter((business) => business.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  function handleLoginAsBusiness(business: Business) {
    startImpersonation(business.id);
    router.push("/app");
  }

  return (
    <>
      <PageHeader
        title="Businesses"
        description="Manage every business running on the PREMO platform"
      >
        <Button size="sm" onClick={openCreateForm}>
          <Plus className="size-4" />
          Add Business
        </Button>
      </PageHeader>

      <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, Login ID, or email..."
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
                  <TableHead>Login ID</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subscription Plan</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBusinesses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                      No businesses match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBusinesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell className="font-medium">{business.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {business.loginId}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {business.password}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {business.email || "—"}
                      </TableCell>
                      <TableCell className="capitalize">
                        {getSubscriptionPlan(business.subscription.plan).name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(business.subscription.expiryDate)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={displayStatus(business)} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-lg outline-none hover:bg-muted">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Open actions for {business.name}</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditForm(business)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/businesses/${business.id}/users`)}
                            >
                              Manage Users
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/admin/subscriptions?business=${business.id}`)
                              }
                            >
                              Manage Subscription
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleLoginAsBusiness(business)}>
                              Login As Business
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(business)}>
                              {business.status === "active" ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              disabled={business.id === DEMO_BUSINESS.id}
                              onClick={() => setDeleteTarget(business)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={handleFormOpenChange}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Business" : "Add Business"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update this business's details."
                : "Create a new business on the PREMO platform."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="e.g. Bella Vista Restaurant"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-id">Business ID</Label>
              <Input
                id="business-id"
                value={form.id}
                disabled={Boolean(editingId)}
                onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))}
                placeholder="auto-generated from name if left blank"
                className="font-mono text-xs"
              />
              {!editingId && (
                <p className="text-xs text-muted-foreground">
                  Used in the business&apos;s share link and can&apos;t be changed later.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-contact">Contact Name</Label>
              <Input
                id="business-contact"
                value={form.contactName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, contactName: event.target.value }))
                }
                placeholder="e.g. Jane Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-email">Email</Label>
              <Input
                id="business-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="e.g. jane@business.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-phone">Phone Number</Label>
              <Input
                id="business-phone"
                type="tel"
                value={form.phoneNumber}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))
                }
                placeholder="e.g. +60123456789"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-login-id">Login ID</Label>
              <Input
                id="business-login-id"
                value={form.loginId}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, loginId: event.target.value }))
                }
                placeholder={editingId ? undefined : "auto-generated if left blank"}
                className="font-mono text-xs"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="business-password">Password</Label>
                <Input
                  id="business-password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder={editingId ? undefined : DEFAULT_BUSINESS_PASSWORD}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-confirm-password">Confirm Password</Label>
                <Input
                  id="business-confirm-password"
                  value={form.confirmPassword}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                  }
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-plan">Subscription Plan</Label>
              <Select
                value={form.plan}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, plan: value as SubscriptionPlanId }))
                }
              >
                <SelectTrigger id="business-plan" className="w-full">
                  <SelectValue>
                    {(value: SubscriptionPlanId) => getSubscriptionPlan(value).name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_PLAN_LIST.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-expiry">Expiry Date</Label>
              <Input
                id="business-expiry"
                type="date"
                value={form.expiryDate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, expiryDate: event.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, status: value as BusinessStatus }))
                }
              >
                <SelectTrigger id="business-status" className="w-full">
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
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => handleFormOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editingId ? "Save Changes" : "Create Business"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Delete Business?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
