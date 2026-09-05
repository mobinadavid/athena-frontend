import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Shield className="size-4" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold tracking-tight">Athena Admin</p>
        <p className="text-[11px] text-muted-foreground">Staff console</p>
      </div>
    </div>
  );
}
