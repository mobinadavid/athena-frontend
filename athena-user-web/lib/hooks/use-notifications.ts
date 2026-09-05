"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationsApi } from "@/lib/api/notifications";
import { dashboardKeys } from "@/lib/hooks/use-dashboard";
import { usePaginatedQuery } from "@/lib/hooks/use-paginated-query";
import type { PaginationParams } from "@/lib/types/api";
import { isApiError } from "@/lib/types/api";

export const notificationKeys = {
  all: ["notifications"] as const,
};

export function useNotifications(params: PaginationParams) {
  return usePaginatedQuery(
    notificationKeys.all,
    async (pageParams) => {
      const data = await notificationsApi.list(pageParams);
      return data.notifications;
    },
    params,
    { refetchInterval: 30_000 },
  );
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.read,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]);
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : "Could not mark notification as read");
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.readAll,
    onSuccess: async () => {
      toast.success("All notifications marked as read");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]);
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : "Could not mark notifications as read");
    },
  });
}
