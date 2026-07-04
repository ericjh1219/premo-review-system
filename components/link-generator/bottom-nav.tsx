"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  FileText,
  Home,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const navItems = [
  { icon: Home, bg: "bg-[#4ecdc4]", iconClass: "text-white", href: "/app" },
  { icon: FileText, bg: "bg-[#facc15]", iconClass: "text-[#1a1a1a]", href: "/app/posts" },
  { icon: BarChart3, bg: "bg-[#1a1a1a]", iconClass: "text-white", href: "/app/dashboard" },
  { icon: User, bg: "bg-[#fdba74]", iconClass: "text-[#1a1a1a]", href: "/app/profile" },
  { icon: LogOut, bg: "bg-[#ec4899]", iconClass: "text-white" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleConfirmLogout() {
    logout();
    setConfirmOpen(false);
    router.push("/login");
  }

  return (
    <nav className="fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-full bg-[#2d3748] px-4 py-2.5 shadow-lg">
        {navItems.map(({ icon: Icon, bg, iconClass, href }, index) => {
          const isActive = href === pathname;
          const itemClassName = cn(
            "flex size-10 items-center justify-center rounded-full transition-transform",
            bg,
            isActive && "ring-2 ring-white/30"
          );

          if (href) {
            return (
              <Link
                key={index}
                href={href}
                aria-label={`Navigation item ${index + 1}`}
                className={itemClassName}
              >
                <Icon className={cn("size-[18px]", iconClass)} />
              </Link>
            );
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => setConfirmOpen(true)}
              aria-label={`Navigation item ${index + 1}`}
              className={itemClassName}
            >
              <Icon className={cn("size-[18px]", iconClass)} />
            </button>
          );
        })}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Log out?</DialogTitle>
            <DialogDescription>
              You'll be signed out of your session and returned to the login screen.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmLogout}>
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
