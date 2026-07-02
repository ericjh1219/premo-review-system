"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type AppSidebarProps = {
  onNavigate?: () => void;
};

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border/60 bg-sidebar/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2.5 px-6">
        <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Star className="size-4 fill-current" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">PREMO</p>
          <p className="text-[11px] text-muted-foreground">Review System</p>
        </div>
      </div>

      <Separator className="opacity-60" />

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className={cn("size-4 shrink-0", isActive && "text-primary")} />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-border/60 p-4">
        <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-4">
          <p className="text-xs font-medium">Pro Plan</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Upgrade for unlimited campaigns and advanced analytics.
          </p>
        </div>
      </div>
    </aside>
  );
}
