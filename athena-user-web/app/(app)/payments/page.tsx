"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { BlockchainChip } from "@/components/blockchain-chip";
import { CreatePaymentDialog } from "@/components/create-payment-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { PaginationBar } from "@/components/pagination-bar";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { usePayments } from "@/lib/hooks/use-payments";
import { isApiError } from "@/lib/types/api";
import { blockchainLabel, formatAmount, formatDate } from "@/lib/utils/format";

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"" | "pending" | "confirmed" | "expired">("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const payments = usePayments({
    page,
    page_size: 10,
    status,
    global_search: search || undefined,
    sort_by: "created_at",
    sort_order: "desc",
  });

  const items = payments.data?.items ?? [];
  const totalPages = payments.data?.total_pages ?? 1;

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Request addresses and track incoming deposits."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus data-icon="inline-start" />
            New Payment Request
          </Button>
        }
      />
      <CreatePaymentDialog open={open} onOpenChange={setOpen} />

      <Card>
        <CardContent className="pt-4">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Search payment requests"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              className="sm:max-w-xs"
            />
            <Select
              value={status || "all"}
              onValueChange={(value) => {
                setPage(1);
                setStatus(value === "all" ? "" : (value as typeof status));
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {payments.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : null}

          {payments.isError ? (
            <p className="text-sm text-destructive">
              {isApiError(payments.error) ? payments.error.message : "Could not load payments."}
            </p>
          ) : null}

          {!payments.isLoading && items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment requests found.</p>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-2 py-2 font-medium">Blockchain</th>
                  <th className="px-2 py-2 font-medium">Requested</th>
                  <th className="px-2 py-2 font-medium">Expected</th>
                  <th className="px-2 py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.uuid} className="hover:bg-muted/40">
                    <td className="px-2 py-3">
                      <Link href={`/payments/${item.uuid}`} className="block">
                        <StatusBadge status={item.status} />
                      </Link>
                    </td>
                    <td className="px-2 py-3">
                      <Link href={`/payments/${item.uuid}`}>
                        <BlockchainChip name={blockchainLabel(item.blockchain)} />
                      </Link>
                    </td>
                    <td className="px-2 py-3">
                      <Link href={`/payments/${item.uuid}`}>{item.requested_count}</Link>
                    </td>
                    <td className="px-2 py-3 tabular-nums">
                      <Link href={`/payments/${item.uuid}`}>
                        {formatAmount(item.expected_amount)}
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">
                      <Link href={`/payments/${item.uuid}`}>{formatDate(item.created_at)}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
