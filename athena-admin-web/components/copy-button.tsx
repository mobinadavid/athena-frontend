"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  className,
  label = "Copy",
  children,
}: {
  value: string;
  className?: string;
  label?: string;
  children?: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size={children ? "sm" : "icon-sm"}
      className={cn(className)}
      aria-label={label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          toast.success("Copied to clipboard");
        } catch {
          toast.error("Could not copy");
        }
      }}
    >
      <Copy className="size-3.5" />
      {children}
    </Button>
  );
}
