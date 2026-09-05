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
import { usePayment, usePaymentTransactions } from "@/lib/hooks/use-admin-data";
import { blockchainLabel, formatAmount, formatDate, truncateAddress } from "@/lib/utils/format";

export default function PaymentDetailPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = use(params);
  const [page, setPage] = useState(1);
  const payment = usePayment(uuid);
  const txs = usePaymentTransactions(uuid, page);
  const item = payment.data;

  return (
    <div>
      <PageHeader
        title="Payment request"
        actions={
          <Button variant="outline" asChild>
            <Link href="/payments">Back</Link>
          </Button>
        }
      />
      {payment.isLoading ? <Skeleton className="mb-4 h-32" /> : null}
      {payment.isError ? <QueryError error={payment.error} /> : null}
      {item ? (
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={item.status} />
                <BlockchainChip name={blockchainLabel(item.blockchain)} />
              </div>
              <CardTitle className="mt-2">{item.requested_count} addresses</CardTitle>
              <CardDescription>
                User{" "}
                {item.user ? (
                  <Link className="underline" href={`/users/${item.user.uuid}`}>
                    {item.user.full_name || item.user.mobile}
                  </Link>
                ) : (
                  item.user_id
                )}{" "}
                · Expected {formatAmount(item.expected_amount)}
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
              <CardTitle>Addresses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(item.wallet_addresses ?? []).map((wallet) => (
                <div key={wallet.uuid} className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 p-2">
                  <span className="font-mono text-xs">{truncateAddress(wallet.wallet_address, 10)}</span>
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
