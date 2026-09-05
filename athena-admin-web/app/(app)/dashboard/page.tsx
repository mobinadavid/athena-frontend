"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CreditCard, Wallet } from "lucide-react";
import { BlockchainChip } from "@/components/blockchain-chip";
import { PageHeader } from "@/components/layout/page-header";
import { QueryError } from "@/components/query-error";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getBlockchainAccent } from "@/lib/blockchain-colors";
import {
  useDashboardSummary,
  useDepositsByBlockchain,
  useDepositsOverTime,
} from "@/lib/hooks/use-admin-data";
import { formatAmount, formatDay } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

const DAY_RANGES = [7, 14, 30, 90] as const;

export default function DashboardPage() {
  const [days, setDays] = useState<(typeof DAY_RANGES)[number]>(14);
  const summary = useDashboardSummary();
  const overTime = useDepositsOverTime(days);
  const byChain = useDepositsByBlockchain();
  const pool = summary.data?.wallet_pool;
  const allocatedPct = pool?.total ? Math.round((pool.allocated / pool.total) * 100) : 0;

  const statusEntries = useMemo(
    () => Object.entries(summary.data?.payment_requests_by_status ?? {}),
    [summary.data],
  );
  const statusTotal = statusEntries.reduce((sum, [, count]) => sum + count, 0) || 1;
  const chartPoints = (overTime.data ?? summary.data?.deposits_over_time ?? []).map((point) => ({
    ...point,
    label: formatDay(point.date),
  }));
  const chainSlices = byChain.data ?? summary.data?.deposits_by_blockchain ?? [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Platform-wide payments, wallets, and deposits."
      />

      {summary.isError ? <QueryError error={summary.error} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summary.isLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : summary.data ? (
          <>
            <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-card dark:from-emerald-950/40">
              <CardHeader>
                <CardDescription>Total received</CardDescription>
                <CardTitle className="text-3xl tabular-nums">
                  {formatAmount(summary.data.total_received_amount)}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
                <CreditCard className="size-4" /> Confirmed deposit amount across all users
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-sky-500 bg-gradient-to-br from-sky-50 to-card dark:from-sky-950/40">
              <CardHeader>
                <CardDescription>Wallet pool</CardDescription>
                <CardTitle className="text-3xl tabular-nums">{pool?.total ?? 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 flex h-2 overflow-hidden rounded-full bg-muted">
                  <span className="bg-sky-500" style={{ width: `${allocatedPct}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">
                  <Wallet className="mr-1 inline size-3.5" />
                  {pool?.allocated ?? 0} allocated · {pool?.free ?? 0} free
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-card dark:from-amber-950/40">
              <CardHeader>
                <CardDescription>Payment requests</CardDescription>
                <CardTitle className="text-3xl tabular-nums">
                  {statusEntries.reduce((sum, [, count]) => sum + count, 0)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                  {statusEntries.map(([status, count]) => (
                    <span
                      key={status}
                      className={cn(
                        "h-full",
                        status === "confirmed" && "bg-emerald-500",
                        status === "pending" && "bg-amber-500",
                        status === "expired" && "bg-rose-500",
                      )}
                      style={{ width: `${(count / statusTotal) * 100}%` }}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {statusEntries.map(([status, count]) => (
                    <span key={status} className="rounded-full bg-muted px-2 py-0.5 text-[11px] capitalize">
                      {status} {count}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Deposits over time</CardTitle>
              <CardDescription>Amount received per day</CardDescription>
            </div>
            <div className="flex gap-1">
              {DAY_RANGES.map((range) => (
                <Button
                  key={range}
                  size="xs"
                  variant={days === range ? "default" : "outline"}
                  onClick={() => setDays(range)}
                >
                  {range}d
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="h-72">
            {overTime.isError ? <QueryError error={overTime.error} /> : null}
            {overTime.isLoading ? <Skeleton className="h-full w-full" /> : null}
            {!overTime.isLoading && chartPoints.length === 0 && !overTime.isError ? (
              <p className="text-sm text-muted-foreground">No deposits in this range.</p>
            ) : null}
            {!overTime.isLoading && chartPoints.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartPoints}>
                  <defs>
                    <linearGradient id="adminDepositFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#0d9488"
                    fill="url(#adminDepositFill)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Deposits by blockchain</CardTitle>
            <CardDescription>Share of received amount</CardDescription>
          </CardHeader>
          <CardContent>
            {byChain.isError ? <QueryError error={byChain.error} /> : null}
            {byChain.isLoading ? <Skeleton className="h-56 w-full" /> : null}
            {!byChain.isLoading && chainSlices.length === 0 && !byChain.isError ? (
              <p className="text-sm text-muted-foreground">No blockchain breakdown yet.</p>
            ) : null}
            {chainSlices.length > 0 ? (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chainSlices}
                        dataKey="amount"
                        nameKey="blockchain"
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={2}
                      >
                        {chainSlices.map((slice) => (
                          <Cell
                            key={slice.blockchain}
                            fill={getBlockchainAccent(slice.blockchain).hex}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="mt-2 space-y-2">
                  {chainSlices.map((slice) => (
                    <li key={slice.blockchain} className="flex items-center justify-between text-sm">
                      <BlockchainChip name={slice.blockchain} />
                      <span className="tabular-nums text-muted-foreground">
                        {slice.count} · {formatAmount(slice.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
