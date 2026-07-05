"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { authDebugLog } from "@/lib/debug-log";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = getSession();
    // This is the closest thing this app has to auth middleware: a
    // client-side guard that runs once per protected page mount. There is
    // no server middleware, no cookie inspection — just this check.
    authDebugLog("AuthGuard check", {
      path: typeof window !== "undefined" ? window.location.pathname : "n/a",
      session,
      result: session ? "authorized" : "redirecting to /login",
    });

    if (!session) {
      router.replace("/login");
      return;
    }
    setAuthorized(true);
  }, [router]);

  if (!authorized) return null;

  return <>{children}</>;
}
