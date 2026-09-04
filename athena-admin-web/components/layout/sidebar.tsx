"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Blocks,
  CreditCard,
  LayoutDashboard,
  MonitorSmartphone,
  Shield,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/wallet-addresses", label: "Wallet addresses", icon: Wallet, soon: true },
  { href: "/blockchains", label: "Blockchains", icon: Blocks, soon: true },
  { href: "/payments", label: "Payments", icon: CreditCard, soon: true },
  { href: "/users", label: "Users", icon: Users, soon: true },
  { href: "/admins", label: "Admins", icon: UserRound, soon: true },
  { href: "/roles", label: "Roles", icon: Shield, soon: true },
];

const SETTINGS = [
  { href: "/settings/profile", label: "Profile", icon: UserRound },
  { href: "/settings/security", label: "Security", icon: Shield },
  { href: "/settings/sessions", label: "Sessions", icon: MonitorSmartphone },
];

function NavLink({
  href,
  label,
  icon: Icon,
  soon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  soon?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  if (soon) {
    return (
      <div className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm text-muted-foreground/70">
        <span className="flex items-center gap-2">
          <Icon className="size-4" />
          {label}
        </span>
        <span className="text-[10px] uppercase tracking-wide">Soon</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
        active
          ? "bg-primary/10 font-medium text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-5">
        <BrandMark />
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        <div className="space-y-1">
          {NAV.map((item) => (
            <NavLink key={item.href} {...item} onNavigate={onNavigate} />
          ))}
        </div>
        <div>
          <p className="mb-1 px-2.5 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            Settings
          </p>
          <div className="space-y-1">
            {SETTINGS.map((item) => (
              <NavLink key={item.href} {...item} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
