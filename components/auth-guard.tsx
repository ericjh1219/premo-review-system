"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";

export function AuthGuard({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  /** Restricts this route to a Super Admin session — Business Admin sessions are redirected to /app. */
  requireAdmin?: boolean;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    if (requireAdmin && !session.adminId) {
      router.replace("/app");
      return;
    }
    setAuthorized(true);
  }, [router, requireAdmin]);

  if (!authorized) return null;

  return <>{children}</>;
}
