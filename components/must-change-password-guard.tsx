"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession, getAuthenticatedBusiness } from "@/lib/auth";

const CHANGE_PASSWORD_PATH = "/app/change-password";

/**
 * Forces a Business Admin who is still on their default/reset password to
 * change it before reaching any other /app page. Only applies to a direct
 * Business Admin session (session.businessId) — a Super Admin viewing a
 * business via Login As Business is never blocked by the business's own
 * mustChangePassword flag.
 */
export function MustChangePasswordGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const session = getSession();
      if (!session?.businessId) {
        if (!cancelled) setReady(true);
        return;
      }

      const business = await getAuthenticatedBusiness();
      if (cancelled) return;

      if (business?.mustChangePassword && pathname !== CHANGE_PASSWORD_PATH) {
        router.replace(CHANGE_PASSWORD_PATH);
        return;
      }

      setReady(true);
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  if (!ready) return null;

  return <>{children}</>;
}
