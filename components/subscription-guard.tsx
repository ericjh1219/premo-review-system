"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import {
  getBusinessById,
  getEffectiveSubscriptionStatus,
  type SubscriptionStatus,
} from "@/lib/business";
import { isImpersonating, resolveBusinessId } from "@/lib/auth";
import { SUBSCRIPTION_EXPIRED_MESSAGE } from "@/lib/subscription";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Fully blocks /app access only when a business's subscription is
 * suspended. An expired subscription instead keeps read-only access to the
 * Dashboard, Profile, existing QR Codes, and Statistics — individual create
 * actions (Posts, Google Review Categories, Branches, Lucky Draw, AI) gate
 * themselves via lib/subscription.ts's canPerformCreateAction. Always
 * bypassed while a Super Admin is impersonating the business (see Login As
 * Business), since that's the whole point of impersonation — being able to
 * inspect any account regardless of its subscription state.
 */
export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [bypassed, setBypassed] = useState(false);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    if (isImpersonating()) {
      setBypassed(true);
      setChecked(true);
      return;
    }

    const business = getBusinessById(resolveBusinessId());
    if (!business) {
      setBypassed(true);
      setChecked(true);
      return;
    }

    setStatus(getEffectiveSubscriptionStatus(business));
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (!bypassed && status === "suspended") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <ShieldAlert className="size-6" />
            </div>
            <p className="font-medium">Access Restricted</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              This business's subscription has been suspended. Please contact PREMO support to
              restore access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {!bypassed && status === "expired" && (
        <div className="bg-destructive px-4 py-2.5 text-center text-sm font-medium text-destructive-foreground">
          {SUBSCRIPTION_EXPIRED_MESSAGE}
        </div>
      )}
      {children}
    </>
  );
}
