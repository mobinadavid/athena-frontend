"use client";

import Link from "next/link";
import { BlockchainChip } from "@/components/blockchain-chip";
import { CopyButton } from "@/components/copy-button";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getBlockchainAccent } from "@/lib/blockchain-colors";
import { useWallets } from "@/lib/hooks/use-wallets";
import { isApiError } from "@/lib/types/api";
import { blockchainLabel, formatDate, truncateAddress } from "@/lib/utils/format";

export default function WalletsPage() {
  const wallets = useWallets();
  const items = wallets.data ?? [];

  return (
    <div>
      <PageHeader
        title="Wallets"
        description="Addresses allocated to your account."
      />

      {wallets.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      ) : null}

      {wallets.isError ? (
        <p className="text-sm text-destructive">
          {isApiError(wallets.error) ? wallets.error.message : "Could not load wallets."}
        </p>
      ) : null}

      {!wallets.isLoading && items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No allocated addresses yet. Create a payment request to get one.
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((wallet) => {
          const label = blockchainLabel(wallet.blockchain);
          const accent = getBlockchainAccent(label);
          return (
            <Link key={wallet.uuid} href={`/wallets/${wallet.uuid}`}>
              <Card
                className="h-full border-l-4 transition-colors hover:bg-muted/30"
                style={{ borderLeftColor: accent.hex }}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div className="space-y-2">
                    <BlockchainChip name={label} />
                    <CardTitle className="font-mono text-sm">
                      {truncateAddress(wallet.wallet_address, 8)}
                    </CardTitle>
                  </div>
                  <StatusBadge status={wallet.is_active ? "active" : "inactive"} />
                </CardHeader>
                <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Allocated {formatDate(wallet.allocated_at)}</span>
                  <span
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <CopyButton value={wallet.wallet_address} />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
