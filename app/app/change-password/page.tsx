"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthenticatedBusiness } from "@/lib/auth";
import { changeBusinessPassword, type Business } from "@/lib/business";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAuthenticatedBusiness().then(setBusiness);
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!business) {
      setError("You must be signed in to change your password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setSubmitting(true);
    const result = await changeBusinessPassword(business.id, currentPassword, newPassword);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Unable to change password.");
      return;
    }

    router.replace("/app/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#e9e9ee] px-5 py-10">
      <div className="w-full max-w-sm space-y-5 rounded-2xl bg-white p-6 shadow-sm">
        <div className="space-y-1 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-[#3554d6]/10">
            <KeyRound className="size-5 text-[#3554d6]" />
          </div>
          <h1 className="text-lg font-bold text-[#1a1a1a]">Change Your Password</h1>
          <p className="text-xs text-[#78716c]">
            For security, you must set a new password before continuing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#3554d6] py-3 text-[15px] font-semibold text-white shadow-sm disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
