import { apiClient } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type { Paginated, PaginationParams } from "@/lib/types/api";
import type { Deposit, WalletAddress } from "@/lib/types/models";

export interface WalletListParams extends PaginationParams {
  blockchain?: string;
  is_active?: string;
  allocated?: string;
}

export interface AllocateWalletPayload {
  blockchain: string;
  count: number;
  expected_amount?: number;
}

export interface WalletAddressPayload {
  wallet_address: string;
  name: string;
  is_active: boolean;
  blockchain_name: string;
  webhook_url: string;
}

export const walletsApi = {
  list(params?: WalletListParams) {
    return apiClient.get<{ wallet_addresses: Paginated<WalletAddress> }>(
      `/wallet-address${toQuery({ ...params })}`,
    );
  },

  getByUuid(uuid: string) {
    return apiClient.get<{ wallet_address: WalletAddress }>(`/wallet-address/${uuid}`);
  },

  allocate(payload: AllocateWalletPayload) {
    return apiClient.post<{ wallet_addresses?: WalletAddress[] }>("/wallet-address/allocate", payload);
  },

  create(payload: WalletAddressPayload) {
    return apiClient.post<{ wallet_address: WalletAddress }>("/wallet-address", payload);
  },

  update(uuid: string, payload: WalletAddressPayload) {
    return apiClient.put<{ wallet_address: WalletAddress }>(`/wallet-address/${uuid}`, payload);
  },

  delete(uuid: string) {
    return apiClient.delete<Record<string, never>>(`/wallet-address/${uuid}`);
  },

  transactions(uuid: string, params?: PaginationParams) {
    return apiClient.get<{ transactions: Paginated<Deposit> }>(
      `/wallet-address/transactions/${uuid}${toQuery({ ...params })}`,
    );
  },
};
