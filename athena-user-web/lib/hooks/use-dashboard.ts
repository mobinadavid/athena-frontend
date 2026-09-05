"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: ["dashboard", "summary"] as const,
  overTime: (days: number) => ["dashboard", "deposits-over-time", days] as const,
  byBlockchain: ["dashboard", "deposits-by-blockchain"] as const,
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary,
    queryFn: dashboardApi.summary,
    refetchInterval: 30_000,
  });
}

export function useDepositsOverTime(days: number) {
  return useQuery({
    queryKey: dashboardKeys.overTime(days),
    queryFn: async () => {
      const data = await dashboardApi.depositsOverTime(days);
      return data.deposits_over_time;
    },
  });
}

export function useDepositsByBlockchain() {
  return useQuery({
    queryKey: dashboardKeys.byBlockchain,
    queryFn: async () => {
      const data = await dashboardApi.depositsByBlockchain();
      return data.deposits_by_blockchain;
    },
  });
}
