"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
          <AppSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
