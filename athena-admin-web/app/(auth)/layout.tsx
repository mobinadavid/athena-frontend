"use client";

import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-gradient-to-br from-cyan-50 via-background to-teal-50 px-4 py-10 dark:from-cyan-950/40 dark:via-background dark:to-teal-950/30">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="mb-8">
        <BrandMark />
      </div>
      {children}
    </div>
  );
}
