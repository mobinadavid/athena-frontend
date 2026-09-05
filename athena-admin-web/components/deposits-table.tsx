import { BlockchainChip } from "@/components/blockchain-chip";
import { PaginationBar } from "@/components/pagination-bar";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/query-error";
import type { Deposit } from "@/lib/types/models";
import { blockchainLabel, formatAmount, formatDate, truncateAddress } from "@/lib/utils/format";

export function DepositsTable({
  items,
  isLoading,
  error,
  page,
  totalPages,
  onPageChange,
}: {
  items: Deposit[];
  isLoading: boolean;
  error: unknown;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return <QueryError error={error} fallback="Could not load transactions." />;
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No transactions yet.</p>;
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b">
              <th className="px-2 py-2 font-medium">Status</th>
              <th className="px-2 py-2 font-medium">Amount</th>
              <th className="px-2 py-2 font-medium">Confirmations</th>
              <th className="px-2 py-2 font-medium">From</th>
              <th className="px-2 py-2 font-medium">Hash</th>
              <th className="px-2 py-2 font-medium">When</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((deposit) => (
              <tr key={deposit.uuid}>
                <td className="px-2 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={deposit.status} />
                    <BlockchainChip name={blockchainLabel(deposit.blockchain)} />
                  </div>
                </td>
                <td className="px-2 py-3 font-medium tabular-nums">
                  {formatAmount(deposit.amount)}
                </td>
                <td className="px-2 py-3 tabular-nums">{deposit.confirmations}</td>
                <td className="px-2 py-3 font-mono text-xs">
                  {truncateAddress(deposit.from_address)}
                </td>
                <td className="px-2 py-3 font-mono text-xs">
                  {truncateAddress(deposit.transaction_hash, 8)}
                </td>
                <td className="px-2 py-3 text-muted-foreground">
                  {formatDate(deposit.paid_at || deposit.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationBar page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}
