import { apiClient } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type { Paginated, PaginationParams } from "@/lib/types/api";
import type { Blockchain } from "@/lib/types/models";

export interface BlockchainPayload {
  native_asset: string;
  title: { en: string; fa?: string };
  name: string;
  is_active: boolean;
}

export const blockchainsApi = {
  list(params?: PaginationParams) {
    return apiClient.get<{ blockchains: Paginated<Blockchain> }>(
      `/blockchain${toQuery({ ...params })}`,
    );
  },

  getByUuid(uuid: string) {
    return apiClient.get<{ blockchain: Blockchain }>(`/blockchain/${uuid}`);
  },

  create(payload: BlockchainPayload) {
    return apiClient.post<{ blockchain: Blockchain }>("/blockchain", payload);
  },

  update(uuid: string, payload: BlockchainPayload) {
    return apiClient.put<{ blockchain: Blockchain }>(`/blockchain/${uuid}`, payload);
  },

  delete(uuid: string) {
    return apiClient.delete<Record<string, never>>(`/blockchain/${uuid}`);
  },
};
