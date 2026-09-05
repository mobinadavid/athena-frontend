"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CreditCard,
  LayoutDashboard,
  MonitorSmartphone,
  Shield,
  UserRound,
  Wallet,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { useDashboardSummary } from "@/lib/hooks/use-dashboard";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/wallets", label: "Wallets", icon: Wallet },
  { href: "/notifications", label: "Notifications", icon: Bell, badgeKey: "notifications" as const },
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
  badge,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors",
        active
          ? "bg-primary/10 font-medium text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <span className="flex items-center gap-2">
        <Icon className="size-4" />
        {label}
      </span>
      {badge ? (
        <span className="rounded-full bg-violet-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </Link>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const summary = useDashboardSummary();
  const unread = summary.data?.unread_notifications ?? 0;

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-5">
        <BrandMark />
      </div>
      <nav className="flex-1 space-y-6 px-3">
        <div className="space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              badge={item.badgeKey === "notifications" ? unread : undefined}
              onNavigate={onNavigate}
            />
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
