"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MoreHorizontal, Plus, Search } from "lucide-react";
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
import { getBusinessById, type Business } from "@/lib/business";
import {
  createUser,
  deleteUser,
  isLastOwner,
  listUsers,
  resetUserPassword,
  setUserStatus,
  updateUser,
  type BusinessUser,
  type UserRole,
} from "@/lib/user";

const ROLES: UserRole[] = ["Owner", "Admin", "Staff"];

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
  role: UserRole;
};

const EMPTY_FORM: FormState = { name: "", email: "", role: "Staff" };

export default function BusinessUsersPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = use(params);

  const [business, setBusiness] = useState<Business | undefined>(undefined);
  const [users, setUsers] = useState<BusinessUser[]>([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BusinessUser | null>(null);
  const [resetTarget, setResetTarget] = useState<BusinessUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  useEffect(() => {
    setBusiness(getBusinessById(businessId));
    setUsers(listUsers(businessId));
  }, [businessId]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) =>
      [user.name, user.email, user.role].join(" ").toLowerCase().includes(query)
    );
  }, [users, search]);

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(user: BusinessUser) {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, role: user.role });
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

    if (!name) {
      setFormError("Name is required.");
      return;
    }
    if (!email) {
      setFormError("Email is required.");
      return;
    }

    if (editingId) {
      const { user, error } = updateUser(businessId, editingId, {
        name,
        email,
        role: form.role,
      });
      if (error) {
        setFormError(error);
        return;
      }
      if (user) {
        setUsers((current) => current.map((existing) => (existing.id === editingId ? user : existing)));
      }
      setFormOpen(false);
      return;
    }

    const created = createUser(businessId, { name, email, role: form.role });
    setUsers((current) => [...current, created]);
    setFormOpen(false);
  }

  function handleToggleStatus(user: BusinessUser) {
    const nextStatus = user.status === "active" ? "inactive" : "active";
    const { user: updated } = setUserStatus(businessId, user.id, nextStatus);
    if (updated) {
      setUsers((current) => current.map((existing) => (existing.id === user.id ? updated : existing)));
    }
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    const { success } = deleteUser(businessId, deleteTarget.id);
    if (success) {
      setUsers((current) => current.filter((user) => user.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  }

  function openResetPassword(user: BusinessUser) {
    setResetTarget(user);
    setNewPassword("");
    setResetError(null);
    setResetSuccess(null);
  }

  function handleResetOpenChange(open: boolean) {
    if (!open) {
      setResetTarget(null);
      setNewPassword("");
      setResetError(null);
      setResetSuccess(null);
    }
  }

  async function handleConfirmReset() {
    if (!resetTarget) return;
    setResetError(null);

    const { success, error } = await resetUserPassword(businessId, resetTarget.id, newPassword);
    if (!success) {
      setResetError(error ?? "Unable to reset password.");
      return;
    }
    setNewPassword("");
    setResetSuccess("Password reset successfully.");
  }

  return (
    <>
      <Link
        href="/admin/businesses"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Businesses
      </Link>

      <PageHeader
        title={business ? `${business.name} — Users` : "Users"}
        description="Manage who has access to this business"
      >
        <Button size="sm" onClick={openCreateForm} disabled={!business}>
          <Plus className="size-4" />
          Add User
        </Button>
      </PageHeader>

      {!business ? (
        <Card className="mt-6 border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardContent className="p-10 text-center text-muted-foreground">
            Business not found.
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-6 border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
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
                {filteredUsers.length} of {users.length} users
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
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                        No users match your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={user.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(user.lastLoginAt)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-lg outline-none hover:bg-muted">
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">Open actions for {user.name}</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditForm(user)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openResetPassword(user)}>
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                                {user.status === "active" ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                disabled={isLastOwner(businessId, user.id)}
                                onClick={() => setDeleteTarget(user)}
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
      )}

      <Dialog open={formOpen} onOpenChange={handleFormOpenChange}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit User" : "Add User"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update this user's details."
                : "Invite a new user to this business."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Name</Label>
              <Input
                id="user-name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="e.g. Jane Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="e.g. jane@business.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-role">Role</Label>
              <Select
                value={form.role}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, role: value as UserRole }))
                }
              >
                <SelectTrigger id="user-role" className="w-full">
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
              <span className="font-medium text-foreground">{deleteTarget?.name}</span> from this
              business. This can't be undone.
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

      <Dialog open={Boolean(resetTarget)} onOpenChange={handleResetOpenChange}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
            <DialogDescription>
              Set a new password for{" "}
              <span className="font-medium text-foreground">{resetTarget?.name}</span>. They will
              need to use this new password to sign in — the current password cannot be recovered
              or displayed.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password">New password</Label>
              <Input
                id="reset-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Set a new password"
              />
            </div>

            {resetError && <p className="text-sm text-destructive">{resetError}</p>}
            {resetSuccess && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">{resetSuccess}</p>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => handleResetOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleConfirmReset}>Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
