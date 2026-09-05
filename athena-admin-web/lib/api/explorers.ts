import { apiClient } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type { Paginated, PaginationParams } from "@/lib/types/api";
import type { BlockchainExplorer } from "@/lib/types/models";

export interface ExplorerPayload {
  base_url: string;
  name: string;
  is_active: boolean;
  blockchains: string[];
  is_default: boolean;
}

export const explorersApi = {
  list(params?: PaginationParams) {
    return apiClient.get<{ blockchain_explorers: Paginated<BlockchainExplorer> }>(
      `/blockchain-explorer${toQuery({ ...params })}`,
    );
  },

  getByUuid(uuid: string) {
    return apiClient.get<{ blockchain_explorer: BlockchainExplorer }>(
      `/blockchain-explorer/${uuid}`,
    );
  },

  create(payload: ExplorerPayload) {
    return apiClient.post<{ blockchain_explorer: BlockchainExplorer }>(
      "/blockchain-explorer",
      payload,
    );
  },

  update(uuid: string, payload: ExplorerPayload) {
    return apiClient.put<{ blockchain_explorer: BlockchainExplorer }>(
      `/blockchain-explorer/${uuid}`,
      payload,
    );
  },

  delete(uuid: string) {
    return apiClient.delete<Record<string, never>>(`/blockchain-explorer/${uuid}`);
  },
};
