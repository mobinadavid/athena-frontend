import { apiClient } from "@/lib/api/client";
import type {
  DashboardSummary,
  DepositByBlockchain,
  DepositOverTimePoint,
} from "@/lib/types/dashboard";

export const dashboardApi = {
  summary() {
    return apiClient.get<DashboardSummary>("/dashboard");
  },

  depositsOverTime(days = 14) {
    return apiClient.get<{ deposits_over_time: DepositOverTimePoint[] }>(
      `/dashboard/deposits-over-time?days=${days}`,
    );
  },

  depositsByBlockchain() {
    return apiClient.get<{ deposits_by_blockchain: DepositByBlockchain[] }>(
      "/dashboard/deposits-by-blockchain",
    );
  },
};
