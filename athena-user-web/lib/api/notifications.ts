import { apiClient } from "@/lib/api/client";
import { toQuery } from "@/lib/api/query-string";
import type { Paginated, PaginationParams } from "@/lib/types/api";
import type { NotificationItem } from "@/lib/types/models";

export const notificationsApi = {
  list(params?: PaginationParams) {
    return apiClient.get<{ notifications: Paginated<NotificationItem> }>(
      `/notifications${toQuery({ ...params })}`,
    );
  },

  readAll() {
    return apiClient.post<Record<string, never>>("/notifications/read-all");
  },

  read(uuid: string) {
    return apiClient.post<Record<string, never>>(`/notifications/${uuid}/read`);
  },
};
