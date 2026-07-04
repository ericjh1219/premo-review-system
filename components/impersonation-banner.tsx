"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCog } from "lucide-react";
import { getImpersonatedBusiness, stopImpersonation } from "@/lib/auth";
import type { Business } from "@/lib/business";
import { Button } from "@/components/ui/button";

export function ImpersonationBanner() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
    setBusiness(getImpersonatedBusiness());
  }, []);

  if (!business) return null;

  function handleReturn() {
    stopImpersonation();
    router.push("/admin/businesses");
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-amber-800 dark:text-amber-300">
      <div className="flex items-center gap-2 text-sm font-medium">
        <UserCog className="size-4" />
        Viewing {business.name} as Super Admin
      </div>
      <Button size="sm" variant="outline" onClick={handleReturn}>
        Return to Super Admin
      </Button>
    </div>
  );
}
