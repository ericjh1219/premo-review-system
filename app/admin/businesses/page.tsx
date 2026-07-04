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
  DEMO_BUSINESS,
  deleteBusiness,
  listBusinesses,
  setBusinessStatus,
  updateBusiness,
  type Business,
} from "@/lib/business";
import { startImpersonation } from "@/lib/auth";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type FormState = {
  id: string;
  name: string;
  contactName: string;
  email: string;
};

const EMPTY_FORM: FormState = { id: "", name: "", contactName: "", email: "" };

export default function BusinessesPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Business | null>(null);

  useEffect(() => {
    setBusinesses(listBusinesses());
  }, []);

  const filteredBusinesses = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return businesses;

    return businesses.filter((business) =>
      [business.name, business.id, business.contactName, business.email]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [businesses, search]);

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
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
    });
    setFormError(null);
    setFormOpen(true);
  }

  function handleFormOpenChange(open: boolean) {
    setFormOpen(open);
    if (!open) {
      setEditingId(null);
      setForm(EMPTY_FORM);
      setFormError(null);
    }
  }

  function handleSave() {
    const name = form.name.trim();
    const contactName = form.contactName.trim();
    const email = form.email.trim();

    if (!name) {
      setFormError("Business name is required.");
      return;
    }

    if (editingId) {
      const updated = updateBusiness(editingId, { name, contactName, email });
      if (updated) {
        setBusinesses((current) =>
          current.map((business) => (business.id === editingId ? updated : business))
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

    const created = createBusiness({ id, name, contactName, email });
    setBusinesses((current) => [...current, created]);
    setFormOpen(false);
  }

  function handleToggleStatus(business: Business) {
    const nextStatus = business.status === "active" ? "inactive" : "active";
    const updated = setBusinessStatus(business.id, nextStatus);
    if (updated) {
      setBusinesses((current) =>
        current.map((existing) => (existing.id === business.id ? updated : existing))
      );
    }
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteBusiness(deleteTarget.id);
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
                  <TableHead>Business ID</TableHead>
                  <TableHead>Contact Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-10" />
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
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {business.id}
                      </TableCell>
                      <TableCell>{business.contactName || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {business.email || "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={business.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(business.createdAt)}
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

          <div className="mt-4 space-y-4">
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
                  Used in the business's share link and can't be changed later.
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
            <DialogTitle>Delete business?</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">{deleteTarget?.name}</span> and stop
              it from appearing anywhere in the platform. This can't be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete Business
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
