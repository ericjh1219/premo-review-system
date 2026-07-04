"use client";

import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
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
  createAdmin,
  deleteAdmin,
  isLastAdmin,
  listAdmins,
  setAdminStatus,
  updateAdmin,
  type AdminRole,
  type AdminUser,
} from "@/lib/admin";

const ROLES: AdminRole[] = ["Admin", "Staff"];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

type FormState = {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
};

const EMPTY_FORM: FormState = { name: "", email: "", password: "", role: "Staff" };

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  useEffect(() => {
    setAdmins(listAdmins());
  }, []);

  const filteredAdmins = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return admins;

    return admins.filter((admin) =>
      [admin.name, admin.email, admin.role].join(" ").toLowerCase().includes(query)
    );
  }, [admins, search]);

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(admin: AdminUser) {
    setEditingId(admin.id);
    setForm({ name: admin.name, email: admin.email, password: "", role: admin.role });
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
    const email = form.email.trim();
    const password = form.password.trim();

    if (!name) {
      setFormError("Name is required.");
      return;
    }
    if (!email) {
      setFormError("Email is required.");
      return;
    }

    if (editingId) {
      const { admin, error } = updateAdmin(editingId, {
        name,
        email,
        role: form.role,
        ...(password ? { password } : {}),
      });
      if (error) {
        setFormError(error);
        return;
      }
      if (admin) {
        setAdmins((current) => current.map((existing) => (existing.id === editingId ? admin : existing)));
      }
      setFormOpen(false);
      return;
    }

    if (!password) {
      setFormError("Password is required.");
      return;
    }

    const created = createAdmin({ name, email, password, role: form.role });
    setAdmins((current) => [...current, created]);
    setFormOpen(false);
  }

  function handleToggleStatus(admin: AdminUser) {
    const nextStatus = admin.status === "active" ? "inactive" : "active";
    const { admin: updated } = setAdminStatus(admin.id, nextStatus);
    if (updated) {
      setAdmins((current) => current.map((existing) => (existing.id === admin.id ? updated : existing)));
    }
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    const { success } = deleteAdmin(deleteTarget.id);
    if (success) {
      setAdmins((current) => current.filter((admin) => admin.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  }

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage the PREMO administrators and staff who can access this dashboard"
      >
        <Button size="sm" onClick={openCreateForm}>
          <Plus className="size-4" />
          Add User
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
                placeholder="Search users..."
                className="pl-9"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {filteredAdmins.length} of {admins.length} users
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      No users match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.name}</TableCell>
                      <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{admin.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={admin.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(admin.lastLoginAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(admin.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-lg outline-none hover:bg-muted">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Open actions for {admin.name}</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditForm(admin)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(admin)}>
                              {admin.status === "active" ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              disabled={isLastAdmin(admin.id)}
                              onClick={() => setDeleteTarget(admin)}
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
            <DialogTitle>{editingId ? "Edit User" : "Add User"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update this user's details."
                : "Create a new admin or staff account for the PREMO dashboard."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Name</Label>
              <Input
                id="admin-name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="e.g. Jane Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="e.g. jane@premostudio.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">
                {editingId ? "New Password" : "Password"}
              </Label>
              <Input
                id="admin-password"
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, password: event.target.value }))
                }
                placeholder={editingId ? "Leave blank to keep current password" : "Set a password"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-role">Role</Label>
              <Select
                value={form.role}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, role: value as AdminRole }))
                }
              >
                <SelectTrigger id="admin-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
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
            <Button onClick={handleSave}>{editingId ? "Save Changes" : "Create User"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">{deleteTarget?.name}</span> and revoke
              their access to the dashboard. This can't be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
