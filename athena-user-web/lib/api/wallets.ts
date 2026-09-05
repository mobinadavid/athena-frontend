import { apiClient } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type { Paginated, PaginationParams } from "@/lib/types/api";
import type { Deposit, WalletAddress } from "@/lib/types/models";

export const walletsApi = {
  list() {
    return apiClient.get<{ wallet_addresses: WalletAddress[] }>("/wallets");
  },

  transactions(uuid: string, params?: PaginationParams) {
    return apiClient.get<{ transactions: Paginated<Deposit> }>(
      `/wallets/${uuid}/transactions${toQuery({ ...params })}`,
    );
  },
};
