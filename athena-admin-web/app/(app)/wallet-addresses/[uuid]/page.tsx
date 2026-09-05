"use client";

import { use, useState } from "react";
import Link from "next/link";
import { BlockchainChip } from "@/components/blockchain-chip";
import { CopyButton } from "@/components/copy-button";
import { DepositsTable } from "@/components/deposits-table";
import { PageHeader } from "@/components/layout/page-header";
import { QueryError } from "@/components/query-error";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet, useWalletTransactions } from "@/lib/hooks/use-admin-data";
import { blockchainLabel, formatDate } from "@/lib/utils/format";

export default function WalletDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = use(params);
  const [page, setPage] = useState(1);
  const wallet = useWallet(uuid);
  const txs = useWalletTransactions(uuid, page);

  return (
    <div>
      <PageHeader
        title="Wallet address"
        description={uuid}
        actions={
          <Button variant="outline" asChild>
            <Link href="/wallet-addresses">Back</Link>
          </Button>
        }
      />
      {wallet.isLoading ? <Skeleton className="mb-4 h-28" /> : null}
      {wallet.isError ? <QueryError error={wallet.error} /> : null}
      {wallet.data ? (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <BlockchainChip name={blockchainLabel(wallet.data.blockchain)} />
                <StatusBadge status={wallet.data.is_active ? "active" : "inactive"} />
              </div>
              <CardTitle className="break-all font-mono text-sm">{wallet.data.wallet_address}</CardTitle>
              <CardDescription>
                {wallet.data.name} · Allocated {formatDate(wallet.data.allocated_at)}
              </CardDescription>
            </div>
            <CopyButton value={wallet.data.wallet_address} />
          </CardHeader>
        </Card>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <DepositsTable
            items={txs.data?.items ?? []}
            isLoading={txs.isLoading}
            error={txs.error}
            page={page}
            totalPages={txs.data?.total_pages ?? 1}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
