"use client";

import { use, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { BlockchainChip } from "@/components/blockchain-chip";
import { DepositsTable } from "@/components/deposits-table";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePayment, usePaymentTransactions } from "@/lib/hooks/use-payments";
import { isApiError } from "@/lib/types/api";
import { blockchainLabel, formatAmount, formatDate, truncateAddress } from "@/lib/utils/format";

export default function PaymentDetailPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = use(params);
  const [page, setPage] = useState(1);
  const payment = usePayment(uuid);
  const transactions = usePaymentTransactions(uuid, page, 10);
  const item = payment.data;

  return (
    <div>
      <PageHeader
        title="Payment request"
        description={uuid}
        actions={
          <Button variant="outline" asChild>
            <Link href="/payments">Back to payments</Link>
          </Button>
        }
      />

      {payment.isLoading ? <Skeleton className="mb-4 h-40 w-full" /> : null}
      {payment.isError ? (
        <p className="mb-4 text-sm text-destructive">
          {isApiError(payment.error) ? payment.error.message : "Could not load payment."}
        </p>
      ) : null}

      {item ? (
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={item.status} />
                <BlockchainChip name={blockchainLabel(item.blockchain)} />
              </div>
              <CardTitle className="mt-2">
                {item.requested_count} address{item.requested_count === 1 ? "" : "es"}
              </CardTitle>
              <CardDescription>
                Expected {formatAmount(item.expected_amount)}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p>{formatDate(item.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expires</p>
                <p>{formatDate(item.expires_at)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Confirmed</p>
                <p>{formatDate(item.confirmed_at)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Allocated addresses</CardTitle>
              <CardDescription>Copy an address to receive funds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(item.wallet_addresses ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No addresses on this request.</p>
              ) : null}
              {(item.wallet_addresses ?? []).map((wallet) => (
                <div
                  key={wallet.uuid}
                  className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 p-2"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs">{truncateAddress(wallet.wallet_address, 10)}</p>
                    <p className="text-[11px] text-muted-foreground">{wallet.name}</p>
                  </div>
                  <CopyButton value={wallet.wallet_address} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Deposits received against this payment request</CardDescription>
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
