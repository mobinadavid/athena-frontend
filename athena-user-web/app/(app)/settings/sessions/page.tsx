"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { tokensApi } from "@/lib/api/tokens";
import { useActiveSessions } from "@/lib/hooks/use-auth";
import { isApiError } from "@/lib/types/api";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function SessionsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const sessions = useActiveSessions(page, 10);

  const revoke = useMutation({
    mutationFn: tokensApi.revokeByUuid,
    onSuccess: async () => {
      toast.success("Session revoked");
      await queryClient.invalidateQueries({ queryKey: ["active-access-tokens"] });
    },
    onError: (error) => {
      toast.error(isApiError(error) ? error.message : "Could not revoke session");
    },
  });

  const items = sessions.data?.items ?? [];
  const totalPages = sessions.data?.total_pages ?? 1;

  return (
    <div>
      <PageHeader
        title="Sessions"
        description="Devices currently holding an active access token."
      />

      <Card>
        <CardHeader>
          <CardTitle>Active devices</CardTitle>
          <CardDescription>
            Revoking a session signs that device out on the next request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : null}

          {sessions.isError ? (
            <p className="text-sm text-destructive">
              {isApiError(sessions.error) ? sessions.error.message : "Could not load sessions."}
            </p>
          ) : null}

          {!sessions.isLoading && items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active sessions.</p>
          ) : null}

          <div className="divide-y">
            {items.map((token) => (
              <div
                key={token.uuid}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {token.user_agent || "Unknown device"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    IP {token.ip || "—"} · Last used {formatDate(token.last_used_at)} · Created{" "}
                    {formatDate(token.created_at)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => revoke.mutate(token.uuid)}
                  disabled={revoke.isPending}
                >
                  Revoke
                </Button>
              </div>
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
