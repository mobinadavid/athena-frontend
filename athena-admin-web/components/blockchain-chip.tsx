import { getBlockchainAccent } from "@/lib/blockchain-colors";
import { cn } from "@/lib/utils";

export function BlockchainChip({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const accent = getBlockchainAccent(name);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        accent.className,
        className,
      )}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: accent.hex }} />
      {name}
    </span>
  );
}
