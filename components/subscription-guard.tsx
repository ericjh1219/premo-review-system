"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { getBusinessById, getEffectiveSubscriptionStatus } from "@/lib/business";
import { isImpersonating, resolveBusinessId } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Blocks /app access once a business's subscription is expired or suspended.
 * Always bypassed while a Super Admin is impersonating the business (see
 * Login As Business), since that's the whole point of impersonation — being
 * able to inspect a lapsed account regardless of its subscription state.
 */
export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (isImpersonating()) {
      setBlocked(false);
      setChecked(true);
      return;
    }

    const business = getBusinessById(resolveBusinessId());
    if (!business) {
      setBlocked(false);
      setChecked(true);
      return;
    }

    const status = getEffectiveSubscriptionStatus(business);
    setBlocked(status === "expired" || status === "suspended");
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (blocked) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <ShieldAlert className="size-6" />
            </div>
            <p className="font-medium">Access Restricted</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              This business's subscription has expired or been suspended. Please contact PREMO
              support to restore access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
