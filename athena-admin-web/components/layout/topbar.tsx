"use client";

import { Menu, LogOut, UserRound } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarNav } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAdminProfile, useLogout } from "@/lib/hooks/use-auth";

export function Topbar() {
  const logout = useLogout();
  const profile = useAdminProfile();
  const [open, setOpen] = useState(false);
  const displayName = profile.data
    ? `${profile.data.first_name} ${profile.data.last_name}`.trim() || profile.data.username
    : "Account";

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="hidden text-sm font-medium lg:block">Athena Admin</div>
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Account menu">
              <UserRound className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
