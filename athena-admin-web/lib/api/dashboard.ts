import { apiClient } from "@/lib/api/client";
import type {
  AdminDashboardSummary,
  DepositByBlockchain,
  DepositOverTimePoint,
} from "@/lib/types/models";

export const dashboardApi = {
  summary() {
    return apiClient.get<AdminDashboardSummary>("/dashboard");
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
