"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { PaginationBar } from "@/components/pagination-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardSummary } from "@/lib/hooks/use-dashboard";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/lib/hooks/use-notifications";
import { isApiError } from "@/lib/types/api";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const notifications = useNotifications({
    page,
    page_size: 15,
    sort_by: "created_at",
    sort_order: "desc",
  });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const items = notifications.data?.items ?? [];
  const summary = useDashboardSummary();
  const unread = summary.data?.unread_notifications ?? items.filter((item) => !item.is_read).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Payment confirmations and expirations."
        actions={
          <Button
            variant="outline"
            disabled={markAll.isPending || unread === 0}
            onClick={() => markAll.mutate()}
          >
            Mark all read
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-4">
          {notifications.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : null}

          {notifications.isError ? (
            <p className="text-sm text-destructive">
              {isApiError(notifications.error)
                ? notifications.error.message
                : "Could not load notifications."}
            </p>
          ) : null}

          {!notifications.isLoading && items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          ) : null}

          <div className="divide-y">
            {items.map((item) => (
              <button
                key={item.uuid}
                type="button"
                className={cn(
                  "flex w-full flex-col gap-1 border-l-4 px-3 py-4 text-left",
                  item.is_read
                    ? "border-transparent text-muted-foreground"
                    : "border-violet-500 bg-violet-50/60 font-medium dark:bg-violet-950/20",
                )}
                onClick={() => {
                  if (!item.is_read) markRead.mutate(item.uuid);
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className={cn("text-sm", !item.is_read && "text-foreground")}>{item.title}</p>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    {formatDate(item.created_at)}
                  </span>
                </div>
                <p className="text-sm font-normal text-muted-foreground">{item.body}</p>
              </button>
            ))}
          </div>

          <PaginationBar
            page={page}
            totalPages={notifications.data?.total_pages ?? 1}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
