"use client";

import { useState } from "react";
import Link from "next/link";
import { BlockchainChip } from "@/components/blockchain-chip";
import { PageHeader } from "@/components/layout/page-header";
import { PaginationBar } from "@/components/pagination-bar";
import { QueryError } from "@/components/query-error";
import { StatusBadge } from "@/components/status-badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DepositsTable } from "@/components/deposits-table";
import { useDeposits, usePayments } from "@/lib/hooks/use-admin-data";
import { blockchainLabel, formatAmount, formatDate } from "@/lib/utils/format";

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [depositPage, setDepositPage] = useState(1);
  const payments = usePayments({
    page,
    page_size: 10,
    status,
    global_search: search || undefined,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const deposits = useDeposits({
    page: depositPage,
    page_size: 10,
    sort_by: "created_at",
    sort_order: "desc",
  });

  return (
    <div>
      <PageHeader title="Payments" description="Monitor payment requests and deposits across all users." />
      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Payment requests</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
        </TabsList>
        <TabsContent value="payments">
          <Card>
            <CardContent className="pt-4">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="Search"
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
                    setStatus(value === "all" ? "" : value);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {payments.isLoading ? <Skeleton className="h-12 w-full" /> : null}
              {payments.isError ? <QueryError error={payments.error} /> : null}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs text-muted-foreground">
                    <tr className="border-b">
                      <th className="px-2 py-2 font-medium">Status</th>
                      <th className="px-2 py-2 font-medium">User</th>
                      <th className="px-2 py-2 font-medium">Chain</th>
                      <th className="px-2 py-2 font-medium">Expected</th>
                      <th className="px-2 py-2 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(payments.data?.items ?? []).map((item) => (
                      <tr key={item.uuid} className="hover:bg-muted/40">
                        <td className="px-2 py-3">
                          <Link href={`/payments/${item.uuid}`}>
                            <StatusBadge status={item.status} />
                          </Link>
                        </td>
                        <td className="px-2 py-3 text-xs">
                          {item.user ? (
                            <Link className="hover:underline" href={`/users/${item.user.uuid}`}>
                              {item.user.full_name || item.user.mobile}
                            </Link>
                          ) : (
                            item.user_id
                          )}
                        </td>
                        <td className="px-2 py-3">
                          <BlockchainChip name={blockchainLabel(item.blockchain)} />
                        </td>
                        <td className="px-2 py-3 tabular-nums">{formatAmount(item.expected_amount)}</td>
                        <td className="px-2 py-3 text-xs text-muted-foreground">
                          {formatDate(item.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationBar
                page={page}
                totalPages={payments.data?.total_pages ?? 1}
                onPageChange={setPage}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="deposits">
          <Card>
            <CardContent className="pt-4">
              <DepositsTable
                items={deposits.data?.items ?? []}
                isLoading={deposits.isLoading}
                error={deposits.error}
                page={depositPage}
                totalPages={deposits.data?.total_pages ?? 1}
                onPageChange={setDepositPage}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
