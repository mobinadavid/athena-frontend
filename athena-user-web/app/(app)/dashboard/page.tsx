"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import { Bell, CreditCard, Wallet } from "lucide-react";
import { BlockchainChip } from "@/components/blockchain-chip";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/status-badge";
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
} from "@/lib/hooks/use-dashboard";
import { usePayments } from "@/lib/hooks/use-payments";
import { isApiError } from "@/lib/types/api";
import { blockchainLabel, formatAmount, formatDate, formatDay } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

const DAY_RANGES = [7, 14, 30, 90] as const;

const STATUS_TONES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  confirmed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  expired: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
};

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "emerald" | "blue" | "violet" | "amber";
}) {
  const tones = {
    emerald:
      "border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-card dark:from-emerald-950/40",
    blue: "border-l-sky-500 bg-gradient-to-br from-sky-50 to-card dark:from-sky-950/40",
    violet:
      "border-l-violet-500 bg-gradient-to-br from-violet-50 to-card dark:from-violet-950/40",
    amber: "border-l-amber-500 bg-gradient-to-br from-amber-50 to-card dark:from-amber-950/40",
  };
  const chips = {
    emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    blue: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  };

  return (
    <Card className={cn("border-l-4 py-4", tones[tone])}>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </CardTitle>
        </div>
        <span className={cn("rounded-lg p-2", chips[tone])}>
          <Icon className="size-4" />
        </span>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">{hint}</CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [days, setDays] = useState<(typeof DAY_RANGES)[number]>(14);
  const summary = useDashboardSummary();
  const overTime = useDepositsOverTime(days);
  const byChain = useDepositsByBlockchain();
  const recent = usePayments({
    page: 1,
    page_size: 5,
    sort_by: "created_at",
    sort_order: "desc",
  });

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
        description="Live snapshot of wallets, deposits, and payment requests."
      />

      {summary.isError ? (
        <p className="mb-4 text-sm text-destructive">
          {isApiError(summary.error) ? summary.error.message : "Could not load dashboard."}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.isLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <StatCard
              title="Allocated wallets"
              value={String(summary.data?.allocated_wallets ?? 0)}
              hint="Addresses currently assigned to you"
              icon={Wallet}
              tone="blue"
            />
            <StatCard
              title="Total received"
              value={formatAmount(summary.data?.total_received_amount ?? 0)}
              hint="Confirmed deposit amount"
              icon={CreditCard}
              tone="emerald"
            />
            <StatCard
              title="Unread notifications"
              value={String(summary.data?.unread_notifications ?? 0)}
              hint="Payment events waiting for you"
              icon={Bell}
              tone="violet"
            />
            <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-card py-4 dark:from-amber-950/40">
              <CardHeader>
                <CardDescription>Payment requests</CardDescription>
                <CardTitle className="text-3xl font-semibold tabular-nums">
                  {statusEntries.reduce((sum, [, count]) => sum + count, 0)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                  {statusEntries.map(([status, count]) => (
                    <span
                      key={status}
                      className={cn(
                        "h-full",
                        status === "confirmed" && "bg-emerald-500",
                        status === "pending" && "bg-amber-500",
                        status === "expired" && "bg-rose-500",
                        !["confirmed", "pending", "expired"].includes(status) && "bg-sky-500",
                      )}
                      style={{ width: `${(count / statusTotal) * 100}%` }}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {statusEntries.map(([status, count]) => (
                    <span
                      key={status}
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                        STATUS_TONES[status] ?? "bg-muted text-muted-foreground",
                      )}
                    >
                      {status} {count}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
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
            {overTime.isLoading ? <Skeleton className="h-full w-full" /> : null}
            {overTime.isError ? (
              <p className="text-sm text-destructive">
                {isApiError(overTime.error)
                  ? overTime.error.message
                  : "Could not load deposits over time."}
              </p>
            ) : null}
            {!overTime.isLoading && !overTime.isError && chartPoints.length === 0 ? (
              <p className="text-sm text-muted-foreground">No deposits in this range.</p>
            ) : null}
            {!overTime.isLoading && chartPoints.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartPoints}>
                  <defs>
                    <linearGradient id="depositFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#8b5cf6"
                    fill="url(#depositFill)"
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
            {byChain.isLoading ? <Skeleton className="h-56 w-full" /> : null}
            {byChain.isError ? (
              <p className="text-sm text-destructive">
                {isApiError(byChain.error)
                  ? byChain.error.message
                  : "Could not load deposits by blockchain."}
              </p>
            ) : null}
            {!byChain.isLoading && chainSlices.length === 0 ? (
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
                    <li
                      key={slice.blockchain}
                      className="flex items-center justify-between text-sm"
                    >
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

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent payments</CardTitle>
            <CardDescription>Your five latest payment requests</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/payments">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : null}
          {recent.isError ? (
            <p className="text-sm text-destructive">
              {isApiError(recent.error) ? recent.error.message : "Could not load payments."}
            </p>
          ) : null}
          {!recent.isLoading && (recent.data?.items.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No payment requests yet.</p>
          ) : null}
          <div className="divide-y">
            {(recent.data?.items ?? []).map((item) => (
              <Link
                key={item.uuid}
                href={`/payments/${item.uuid}`}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={item.status} />
                  <BlockchainChip name={blockchainLabel(item.blockchain)} />
                  <span className="text-sm text-muted-foreground">
                    {item.requested_count} address{item.requested_count === 1 ? "" : "es"}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatAmount(item.expected_amount)} · {formatDate(item.created_at)}
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
