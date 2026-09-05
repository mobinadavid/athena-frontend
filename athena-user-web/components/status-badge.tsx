import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending:
    "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  confirmed:
    "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  expired:
    "border-transparent bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
  detected:
    "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  active:
    "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  inactive:
    "border-transparent bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {status}
    </Badge>
  );
}
