import { apiClient } from "@/lib/api/client";
import type { Paginated, PaginationParams } from "@/lib/types/api";
import type { LoginTokensData } from "@/lib/types/auth";
import type { AccessToken } from "@/lib/types/models";

function toQuery(params?: PaginationParams) {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.page_size) search.set("page_size", String(params.page_size));
  if (params?.sort_by) search.set("sort_by", params.sort_by);
  if (params?.sort_order) search.set("sort_order", params.sort_order);
  if (params?.global_search) search.set("global_search", params.global_search);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const tokensApi = {
  refresh() {
    return apiClient.post<LoginTokensData>("/access-tokens/refresh", {});
  },

  list(params?: PaginationParams) {
    return apiClient.get<{ access_tokens: Paginated<AccessToken> }>(
      `/access-tokens${toQuery(params)}`,
    );
  },

  active(params?: PaginationParams) {
    return apiClient.get<{ access_tokens: Paginated<AccessToken> }>(
      `/active-access-tokens${toQuery(params)}`,
    );
  },

  revokeByUuid(uuid: string) {
    return apiClient.delete<Record<string, never>>(`/access-tokens/revoke/${uuid}`);
  },

  revokeCurrent() {
    return apiClient.delete<Record<string, never>>(
      "/access-tokens/revoke/current-token",
    );
  },

  revokeAll() {
    return apiClient.delete<Record<string, never>>("/access-tokens/revoke");
  },
};
