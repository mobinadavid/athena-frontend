import { apiClient } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type { Paginated } from "@/lib/types/api";
import type { Blockchain } from "@/lib/types/models";

function asList(raw: Paginated<Blockchain> | Blockchain[] | undefined): Blockchain[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return raw.items ?? [];
}

export const blockchainsApi = {
  async list() {
    const data = await apiClient.get<{
      blockchains?: Paginated<Blockchain> | Blockchain[];
      blockchain?: Paginated<Blockchain> | Blockchain[];
    }>(`/blockchain${toQuery({ page: 1, page_size: 100 })}`);
    const items = asList(data.blockchains ?? data.blockchain);
    return items.filter((chain) => chain.is_active);
  },
};
