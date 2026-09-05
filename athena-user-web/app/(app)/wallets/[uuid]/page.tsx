"use client";

import { use, useState } from "react";
import Link from "next/link";
import { BlockchainChip } from "@/components/blockchain-chip";
import { CopyButton } from "@/components/copy-button";
import { DepositsTable } from "@/components/deposits-table";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallets, useWalletTransactions } from "@/lib/hooks/use-wallets";
import { isApiError } from "@/lib/types/api";
import { blockchainLabel, formatDate, truncateAddress } from "@/lib/utils/format";

export default function WalletDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = use(params);
  const [page, setPage] = useState(1);
  const wallets = useWallets();
  const wallet = wallets.data?.find((item) => item.uuid === uuid);
  const transactions = useWalletTransactions(uuid, page, 10);

  return (
    <div>
      <PageHeader
        title="Wallet"
        description={wallet ? truncateAddress(wallet.wallet_address, 10) : uuid}
        actions={
          <Button variant="outline" asChild>
            <Link href="/wallets">Back to wallets</Link>
          </Button>
        }
      />

      {wallets.isLoading ? <Skeleton className="mb-4 h-28 w-full" /> : null}
      {wallets.isError ? (
        <p className="mb-4 text-sm text-destructive">
          {isApiError(wallets.error) ? wallets.error.message : "Could not load wallet."}
        </p>
      ) : null}

      {wallet ? (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <BlockchainChip name={blockchainLabel(wallet.blockchain)} />
                <StatusBadge status={wallet.is_active ? "active" : "inactive"} />
              </div>
              <CardTitle className="font-mono text-sm break-all">{wallet.wallet_address}</CardTitle>
              <CardDescription>
                {wallet.name} · Allocated {formatDate(wallet.allocated_at)}
              </CardDescription>
            </div>
            <CopyButton value={wallet.wallet_address} />
          </CardHeader>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Deposits received on this address</CardDescription>
        </CardHeader>
        <CardContent>
          <DepositsTable
            items={transactions.data?.items ?? []}
            isLoading={transactions.isLoading}
            error={transactions.error}
            page={page}
            totalPages={transactions.data?.total_pages ?? 1}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
