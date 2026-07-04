"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { getAuthenticatedAdmin, logout } from "@/lib/auth";

type TopNavProps = {
  onMenuClick?: () => void;
};

export function TopNav({ onMenuClick }: TopNavProps) {
  const router = useRouter();
  const [admin] = useState(getAuthenticatedAdmin);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </Button>

      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customers, reviews, campaigns..."
          className="h-9 rounded-full border-border/60 bg-muted/40 pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <ThemeToggle />

        <Button variant="ghost" size="icon" className="relative size-9 rounded-full">
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="relative size-9 rounded-full p-0">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                    {admin
                      ? admin.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "AD"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{admin?.name ?? "Admin User"}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {admin?.email ?? "admin@premo.io"}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/admin/settings")}>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
