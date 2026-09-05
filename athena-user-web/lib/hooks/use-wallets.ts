"use client";

import { useQuery } from "@tanstack/react-query";
import { walletsApi } from "@/lib/api/wallets";
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query";

export const walletKeys = {
  all: ["wallets"] as const,
  list: ["wallets", "list"] as const,
  transactions: (uuid: string) => ["wallets", uuid, "transactions"] as const,
};

export function useWallets() {
  return useQuery({
    queryKey: walletKeys.list,
    queryFn: async () => {
      const data = await walletsApi.list();
      return data.wallet_addresses;
    },
  });
}

export function useWalletTransactions(uuid: string, page = 1, pageSize = 10) {
  return usePaginatedQuery(
    walletKeys.transactions(uuid),
    async (params) => {
      const data = await walletsApi.transactions(uuid, params);
      return data.transactions;
    },
    { page, page_size: pageSize, sort_by: "created_at", sort_order: "desc" },
    { enabled: Boolean(uuid) },
  );
}
